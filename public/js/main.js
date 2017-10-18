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
        scope.skills = scope.personal.skills
        let skills = {};
        
        scope.add = ()=>{
            var sk = prompt('Add skill:point');
            if(sk && /:/.test(sk)){
                skills[sk.split(':')[0]] = sk.split(':')[1];
                scope.personal.skills = skills;
                scope.skills = skills;
                updatePersonal(scope.personal);
            }
        }        


    }

    let template = (el,attr)=>{
        return `<span class="add-rating" ng-click="add()"><i class="fa fa-plus"></i></span>
        <div class="rating" id="rate-circle" ng-repeat="(name,rate) in skills">
        <label cv-editable data-type="skills.{{name}}" class="cv-editable">{{name}}</label>
        <svg ng-repeat="i in []|range:rate"  id="radialrate" class="radialrate" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0">
        <circle id="radialrate-fill" class="radialprogress-fill" ng-click="change()"></circle>
        </svg>
        <span class="add-rating" ng-click="add()"><i class="fa fa-plus"></i></span>
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
    let scp;
    
    let link=(scope,element,attrs)=>{
        let el = element[0];        
        el.addEventListener('dblclick',_=>{            
            createInput(el);
        });
        scp = scope;
    }
    
    let createInput = (el)=>{
        let editField = el.nextSibling;
        let textLength = el.innerText.length;
        var input;
        if(editField && /\edit\-field/.test(editField.className)){
            editField.style.display = '';
            input = editField;            
        }else{
            var type = 'input'
            if(textLength > 60){
                type = 'textarea';
            }
            input = document.createElement(type);
            input.type = 'text';
            input.className = 'edit-field';
            input.dataset.for = el.dataset.type;
            input.value = el.innerText;
            input.style.display = '';
            el.insertAdjacentElement('afterend',input);
        }
        setTimeout(function() {
            input.focus();
        }, 500);
        el.style.display = 'none';
        input.addEventListener('keydown',e=>{
            if(e.key == 'Enter'){
                save(el,input);
                scp.cb();
            }
            if(e.key == 'Escape'){
                closeEditable(input,el);
            }
            if(e.key == 'Tab' && !e.shiftKey){
                e.preventDefault();
                save(el,input);
                scp.cb();
                goToNext(el,input);
                
            }
            if(e.key == 'Tab' && e.shiftKey){
                e.preventDefault();
                save(el,input);
                scp.cb();
                goToPrev(el,input);
                
            }
            // console.log(e.key);            
        });  
    }
    
    let closeEditable = (inp,el)=>{
        inp.remove();
        el.style.display = '';
    }
    
    let save = (el,input)=>{
        el.innerText = input.value;
        personal[el.dataset.type].val = el.innerText;
        closeEditable(input,el);        
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

/**
* @author A PEN BY CAPTAIN ANONYMOUS
*/
app.directive('resizable', function() {
    var toCall;
    function throttle(fun) {
        if (toCall === undefined) {
            toCall = fun;
            setTimeout(function() {
                toCall();
                toCall = undefined;
            }, 100);
        } else {
            toCall = fun;
        }
    }
    return {
        restrict: 'AE',
        scope: {
            rDirections: '=',
            rCenteredX: '=',
            rCenteredY: '=',
            rWidth: '=',
            rHeight: '=',
            rFlex: '=',
            rGrabber: '@',
            rDisabled: '@',
            rCb:'&'
        },
        link: function(scope, element, attr) {
            var flexBasis = 'flexBasis' in document.documentElement.style ? 'flexBasis' :
            'webkitFlexBasis' in document.documentElement.style ? 'webkitFlexBasis' :
            'msFlexPreferredSize' in document.documentElement.style ? 'msFlexPreferredSize' : 'flexBasis';
            
            // register watchers on width and height attributes if they are set
            scope.$watch('rWidth', function(value){
                element[0].style.width = scope.rWidth + 'px';
            });
            scope.$watch('rHeight', function(value){
                element[0].style.height = scope.rHeight + 'px';
            });
            
            element.addClass('resizable');
            
            var style = window.getComputedStyle(element[0], null),
            w,
            h,
            dir = scope.rDirections,
            vx = scope.rCenteredX ? 2 : 1, // if centered double velocity
            vy = scope.rCenteredY ? 2 : 1, // if centered double velocity
            inner = scope.rGrabber ? scope.rGrabber : '<span></span>',
            start,
            dragDir,
            axis,
            info = {};
            
            var updateInfo = function(e) {
                info.width = false; info.height = false;
                if(axis === 'x')
                info.width = parseInt(element[0].style[scope.rFlex ? flexBasis : 'width']);
                else
                info.height = parseInt(element[0].style[scope.rFlex ? flexBasis : 'height']);
                info.id = element[0].id;
                info.evt = e;
            };
            
            var dragging = function(e) {
                var prop, offset = axis === 'x' ? start - e.clientX : start - e.clientY;
                switch(dragDir) {
                    case 'top':
                    prop = scope.rFlex ? flexBasis : 'height';
                    element[0].style[prop] = h + (offset * vy) + 'px';
                    break;
                    case 'bottom':
                    prop = scope.rFlex ? flexBasis : 'height';
                    element[0].style[prop] = h - (offset * vy) + 'px';
                    break;
                    case 'right':
                    prop = scope.rFlex ? flexBasis : 'width';
                    element[0].style[prop] = w - (offset * vx) + 'px';
                    break;
                    case 'left':
                    prop = scope.rFlex ? flexBasis : 'width';
                    element[0].style[prop] = w + (offset * vx) + 'px';
                    break;
                }
                updateInfo(e);
                throttle(function() { scope.$emit('angular-resizable.resizing', info);});
                if(typeof scope.rCb == 'function'){
                    scope.rCb();
                }
            };
            var dragEnd = function(e) {
                updateInfo();
                scope.$emit('angular-resizable.resizeEnd', info);
                scope.$apply();
                document.removeEventListener('mouseup', dragEnd, false);
                document.removeEventListener('mousemove', dragging, false);
                element.removeClass('no-transition');
                if(typeof scope.rEndCb == 'function'){
                    scope.rEndCb();
                }
                
            };
            var dragStart = function(e, direction) {
                dragDir = direction;
                axis = dragDir === 'left' || dragDir === 'right' ? 'x' : 'y';
                start = axis === 'x' ? e.clientX : e.clientY;
                w = parseInt(style.getPropertyValue('width'));
                h = parseInt(style.getPropertyValue('height'));
                
                //prevent transition while dragging
                element.addClass('no-transition');
                
                document.addEventListener('mouseup', dragEnd, false);
                document.addEventListener('mousemove', dragging, false);
                
                // Disable highlighting while dragging
                if(e.stopPropagation) e.stopPropagation();
                if(e.preventDefault) e.preventDefault();
                e.cancelBubble = true;
                e.returnValue = false;
                
                updateInfo(e);
                scope.$emit('angular-resizable.resizeStart', info);
                scope.$apply();
                
            };
            
            dir.forEach(function (direction) {
                var grabber = document.createElement('div');
                
                // add class for styling purposes
                grabber.setAttribute('class', 'rg-' + direction);
                grabber.innerHTML = inner;
                element[0].appendChild(grabber);
                grabber.ondragstart = function() { return false; };
                grabber.addEventListener('mousedown', function(e) {
                    var disabled = (scope.rDisabled === 'true');
                    if (!disabled && e.which === 1) {
                        // left mouse click
                        dragStart(e, direction);
                    }
                }, false);
            });
        }
    };
});

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
        skills:{
            javascript : 10,
            HTML5 : 10  
        }
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

