/**
* 
*/

var app = angular.module('cvCreator',[]);

app.controller('mainController',['$scope','$http',($scope,$http)=>{
    
    $scope.fonts = fonts;
    
    $scope.getPersonal = ()=>{
        return getPersonal();
        // return typeof localStorage.personal == 'undefined'?defaults:Object.assign(defaults,JSON.parse(localStorage.personal));
    }
    
    $scope.img_src = typeof localStorage.avatar == 'undefined'?'':localStorage.avatar;
    $scope.personal = $scope.getPersonal();
    
    $scope.uploadImg = (e)=>{        
        var file = document.createElement('input');
        file.type = 'file';
        file.accept= ".jpg, .jpeg, .png";
        file.name = 'file';
        file.click();
        
        
        file.onchange = _=>{
            var fd = new FormData();
            fd.append('file',file.files[0]);
            
            $http.post('/upload',fd,{
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(res=>{
                $scope.img_src = `/uploads/${file.files[0].name}`;
                localStorage.avatar = `/uploads/${file.files[0].name}`;
            },err=>{
                console.warn(err);
            });
        }       
    };
    
    $scope.resizeCallback = ()=>{
        document.querySelector('#img-wrapper').style.height = document.querySelector('left').clientWidth+'px';        
    }
    
    $scope.save = (msg)=>{
        console.log(msg);
    }
    
    
}]);


app.directive('a4',()=>{
    return {
        templateUrl:'templates/a4.html'
    };
});

app.directive('left',()=>{
    return {
        templateUrl:'templates/a4_left.html'
    };
});

app.directive('right',()=>{
    return {
        templateUrl:'templates/a4_right.html'
    };
});

app.directive('avatar',()=>{
    return {
        templateUrl:'templates/a4_avatar.html'
    };
});

app.directive('personal',()=>{
    return {
        templateUrl:'templates/a4_personal.html'
    };
});

app.directive('rating',()=>{
    return {
        templateUrl:'templates/a4_rating.html'
    };
});

app.directive('rate',()=>{
    let link = (scope,el,atts)=>{
        scope.personal = getPersonal();
        scope.skills = scope.personal.skills;
        scope.color = 'green';     
        
        scope.add = ()=>{
            var sk = prompt('Add skill:point');
            if(sk && /:/.test(sk)){
                var skill = stringToParam('label:rate:color',sk.split(':'));
                    
                var index = scope.skills.findIndex(e=>e.label.toLowerCase() == skill.label.toLowerCase());
                if(index > -1){
                    angular.extend(scope.skills[index],skill);
                    // scope.skills[index] = skill;
                }else{
                    scope.skills.push(skill);    
                }                
                scope.update();
            }
        }

        scope.delete = (i)=>{
            var con = confirm('Bist du sicher?');
            if(!con)return;
            scope.skills.splice(i,1);
            scope.update();
        }

        scope.rate = (el)=>{
            var pr = prompt('Rate');
            var opt = stringToParam('rate:color',pr.split(':'));
            if(isNaN(opt.rate)){alert('Bitte Zahl eingeben');scope.rate(el);return;}
            if(parseInt(opt.rate)>10 ||parseInt(opt.rate)<1){alert('0< ZAHL < 11');scope.rate(el);return;}
            console.log(scope.skills);
            angular.extend(scope.skills[el],opt);
            scope.update();       
        }

        scope.update = ()=>{
            scope.personal.skills = scope.skills;
            updatePersonal(scope.personal);
        }
    }
    
    let template = (el,attr)=>{
        return `<div class="add-rating-wrapper"><span class="add-rating" ng-click="add()"><i class="fa fa-plus"></i></span></div>
        <div class="rate-circle-wrapper" id="rate-circle" ng-repeat="(ind,skill) in skills track by $index">
        <label cv-editable data-type="skills.{{ind}}.label" class="cv-editable">{{skill.label}}</label>
        <div class="circles-wrapper">
        <svg ng-repeat="i in []|range:skill.rate" ng-click="rate(ind)"  id="radialrate" class="radialrate" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0">
        <circle id="radialrate-fill" class="radialprogress-fill" fill="{{skill.color?skill.color:color}}"></circle>
        </svg>        
        </div><span class="delete-skill" ng-click="delete(ind)"><i class="fa fa-minus"></i></span>
        </div>`;
    }
    return{
        link:link,
        scope:{
            
        },
        template : template,
        link:link
    }
});


app.directive('fontSelector',['$filter',($filter)=>{
    let link = (scope,el,attrs)=>{        
        scope.opened = false;
        
        scope.openBox = ()=>{
            scope.opened = !scope.opened;            
        }
        scope.select = (select,fr)=>{
            scope.selected = select;
            scope.updateIcon(select,fr);
            scope.openBox();
        }
        
        scope.updateIcon = function(sel,fr){            
            var temp = getPersonal();
            temp[fr].icon = sel;
            updatePersonal(temp);            
        }
        
    }
    
    let template = (el,attr)=>{
        return `<div class="font-selector-wrapper">        
        <div class="selected" ng-click="openBox()"><i class="fa fa-{{selected}}"></i></div>
        <div class="font-selector" ng-show="opened" ng-class="{'opened':opened}">
        <input type="text" class="search" ng-model="search">            
        <div class="font-item" ng-repeat="f in fonts | filter:search track by $index" ng-click="select(f,'${attr.for}')" title="{{f}}"><i  class="fa fa-{{f}}"></i></div>
        </div>
        </div>`
    }
    return{
        restrict:'E',
        scope: {
            fonts: '=',
            selected: '=',
            for:'='      
        },
        link:link,
        template:template
    }
}]);

app.directive('cvEditable',[(PERSONAL)=>{
    let personal = getPersonal();
    let input_;
    let cb_;
    
    let link=(scope,element,attrs)=>{
        let el = element[0];        
        el.addEventListener('dblclick',_=>{            
            createInput(el);
        });
        cb_ = scope.cb;    
    }
    
    let createInput = (el)=>{
        let editField = el.nextSibling;
        let textLength = el.innerText.length;
        
        if(editField && /\edit\-field/.test(editField.className)){
            editField.style.display = '';
            input = editField;            
        }else{
            var type = 'input'
            if(textLength > 60){
                type = 'textarea';
            }
            input_ = document.createElement(type);
            input_.type = 'text';
            input_.className = 'edit-field';
            input_.dataset.for = el.dataset.type;
            input_.value = el.innerText;
            input_.style.display = '';
            el.insertAdjacentElement('afterend',input_);
        }
        setTimeout(function() {
            input_.focus();
        }, 500);
        el.style.display = 'none';
        input_.addEventListener('keydown',e=>{
            if(e.key == 'Enter'){
                save(el);                
            }
            if(e.key == 'Escape'){
                closeEditable(input,el);
            }
            if(e.key == 'Tab' && !e.shiftKey){
                e.preventDefault();
                save(el);
                
                goToNext(el);
                
            }
            if(e.key == 'Tab' && e.shiftKey){
                e.preventDefault();
                save(el);
                
                goToPrev(el);
                
            }
            // console.log(e.key);            
        });  
    }
    
    let closeEditable = (el)=>{
        input_.remove();
        el.style.display = '';
    }
    
    let save = (el)=>{
        personal = getPersonal();
        el.innerText = input_.value;
        console.log(personal[el.dataset.type]);
        initToObject(personal,el.dataset.type,el.innerText)
        // personal[el.dataset.type].val = el.innerText;
        closeEditable(el);        
        update();
    }
    
    let goToNext = (el,input) =>{
        let next = getNextEditable(el);
        if(next){
            createInput(next);
        }
        
    }
    
    let goToPrev = (el,input) =>{
        let next = getPrevEditable(el);
        if(next){
            createInput(next);
        }
        
    }
    
    let update = el=>{        
        updatePersonal(personal);
    }
    
    return {
        restrict:'A',
        link: link,
        scope:{
            cb:'&'
        }
    };
}]);

app.filter('range',()=>{
    return (...arguments)=>{
        var input = arguments[0];
        var diff = 1;
        if(arguments.length >2){
            start = parseInt(arguments[1]);
            end = parseInt(arguments[2]);
            if(arguments.length>3){
                diff = parseInt(arguments[3]);
            }
        }
        if(arguments.length<=2){
            start = 1;
            end = parseInt(arguments[1]);
        }        
        for(let i = start;i<=end;i+=diff){
            input.push(i);
        }
        return input;
    }
});


// ################################# native js functions

HTMLElement.prototype.prev = function(sel){
    var pr = this.previousElementSibling;
    var el;
    if(!pr || !(pr instanceof HTMLElement))return;
	if(pr.matches(sel)){
		el= pr;
    }else{
        return pr.prev(sel);
    }
    return el;
}

HTMLElement.prototype.next = function(sel){
    var pr = this.nextElementSibling;
    var el;
    if(!pr || !(pr instanceof HTMLElement))return;
    
	if(pr.matches(sel)){        
		el = pr;
    }else{ 
        return pr.next(sel);
    }
    return el;
}

function getNextEditable(el){
    var sel = '[cv-editable]';
    var next = el.next(sel);
    var temp;
    
    
    if(!next){
        temp =  el.nextElementSibling;
        if(temp){
            next = temp.querySelector(sel);
            console.log('sibling -> child');
        }        
    }
    if(!next){
        temp =  el.parentElement;
        if(temp){
            temp = temp.nextElementSibling;
        }
        if(temp){
            next = temp.querySelector(sel);
            console.log('parent -> sibling -> child');
        }
    }
    if(!next){
        temp =  el.parentElement;
        if(temp){
            next = temp.next(sel);
            console.log('parent -> sibling');
        }        
    }    
    return next;
}

function getPrevEditable(el){
    var sel = '[cv-editable]';    
    var prev = el.prev(sel);
    var temp;
    
    
    if(!prev){        
        temp =  el.previousElementSibling;
        if(temp){
            prev = temp.querySelector(sel);
            console.log('sibling -> child');
        }        
    }
    if(!prev){        
        temp =  el.parentElement;
        if(temp){
            temp = temp.previousElementSibling;
        }
        if(temp){
            prev = temp.querySelector(sel);
            console.log('parent -> sibling -> child');
        }
    }
    if(!prev){
        console.log('parent -> sibling');
        temp =  el.parentElement;
        if(temp){
            prev = temp.prev(sel);
        }        
    } 
    return prev;
}


function getPersonal(){
    var defaults = {
        name : 'Mücahid Dayan',
        prof : 'webdeveloper',
        email: {
            icon:'envelope',
            val:'muecahid@dayan.one',
        },
        phone: {
            icon: 'phone',
            val:'32',
        },
        homepage: {
            icon:'home',
            val:'https://mücahiddayan.com'
        },
        skills:[
            {
                rate:10,
                label:'javascript'
            },
            {
                rate:10,
                label:'HTML5'
            },
        ]
    };
    var personal = {};
    var temp = typeof localStorage.personal == 'undefined' ||
    localStorage.personal == '' || 
    localStorage.personal == null || 
    localStorage.personal == 'null'
    ?defaults:JSON.parse(localStorage.personal);        
    return Object.assign(temp,personal);
}

function updatePersonal(update){
    var personal = getPersonal();
    var temp = Object.assign(personal,update);
    localStorage.personal = JSON.stringify(temp);
}

function getFromObject(obj,str,splitter='.'){
	if(!new RegExp(splitter).test(str)){
		return obj[str];
	}
	let temp = str.split(splitter);
	var ret = obj[temp[0]];
	if(typeof ret == 'undefined')return;
	for(let i = 1 ; i< temp.length;i++){
		ret = ret[temp[i]];
	}
	return ret;
}

function initToObject(obj,path,init,splitter='.'){    
    if(!new RegExp(splitter).test(path)){
		return obj[path] = init;
    }
    
    var i;
    path = path.split(splitter);
    for (i = 0; i < path.length - 1; i++){
        obj = obj[path[i]];
    }
    if(!obj){
        console.warn('object is empty');
        return
    };
    obj[path[i]] = init;
    return obj;
}

function stringToParam(str,values,splitter=':'){
    var str = str.split(splitter);
    var obj = {};
    
    for(let i = 0; i< str.length; i ++){
        if(values[i]){
            obj[str[i]] = values[i]
        }
    }
    return obj;
}