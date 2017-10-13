/**
* 
*/

var app = angular.module('cvCreator',[]);

app.controller('mainController',['$scope','$http',($scope,$http)=>{
    
    $scope.fonts = fonts;
   
    $scope.getPersonal = ()=>{
        var defaults = {
            name : 'Mücahid Dayan',
            prof : 'webdeveloper',
            email: 'muecahid@dayan.one',
            phone: '01776505421',
            homepage:'https://mücahiddayan.com'
        };
        return typeof localStorage.personal == 'undefined'?defaults:Object.assign(defaults,JSON.parse(localStorage.personal));
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

app.directive('fontSelector',['$filter',($filter)=>{
    let link = (scope,el,attrs)=>{        
       scope.opened = false;
       scope.selected = 'address-card';
        scope.openBox = ()=>{
            scope.opened = !scope.opened;            
        }
        scope.select = (select)=>{
            scope.selected = select;
            scope.openBox();
        }
                
        
    }

    let template = (el,attr)=>{
        return `<div class="font-selector-wrapper">        
        <div class="selected" ng-click="openBox()"><i class="fa fa-{{selected}}"></i></div>
        <div class="font-selector" ng-class="{'opened':opened}">
        <input type="text" class="search" ng-model="search">            
        <div class="font-item" ng-repeat="f in fonts | filter:search track by $index" ng-click="select(f)" title="{{f}}"><i  class="fa fa-{{f}}"></i></div>
        </div>
    </div>`
    }
    return{
        restrict:'E',
        scope: {
            fonts: '=',            
        },
        link:link,
        template:template
    }
}]);

app.directive('cvEditable',()=>{
    let personal = {};
    
    let link=(scope,element,attrs)=>{
        let el = element[0];        
        el.addEventListener('dblclick',_=>{            
            createInput(el);
        });
    }

    let createInput = el=>{
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
            }
            if(e.key == 'Tab' && !e.shiftKey){
                save(el,input);
                goToNext(el,input);
            }
            if(e.key == 'Tab' && e.shiftKey){
                save(el,input);
                goToPrev(el,input);
            }
                // console.log(e.key);            
        });  
    }

    let init = (el)=>{
        
    }

    let save = (el,input)=>{
        el.innerText = input.value;
        personal[el.dataset.type] = el.innerText;
        input.remove();
        el.style.display = '';
        update();
    }

    let goToNext = (el,input) =>{
        let next = el.next('[cv-editable]');
        if(next){
            console.log(next);
            createInput(next);
        }
        
    }

    let goToPrev = (el,input) =>{
        let next = el.prev('[cv-editable]');
        if(next){
            console.log(next);
            createInput(next);
        }
        
    }

    let update = el=>{        
        var temp = typeof localStorage.personal == 'undefined' ||
                          localStorage.personal == '' || 
                          localStorage.personal == null || 
                          localStorage.personal == 'null'
                                            ?{}:JSON.parse(localStorage.personal);        
        console.log(personal,temp);
        localStorage.personal=JSON.stringify(Object.assign(temp,personal));
    }

    return {
        restrict:'A',
        link: link
    };
});

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

HTMLElement.prototype.prev = function(sel){
    var pr = this.previousElementSibling;
    var el;
    if(!pr)return;
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
    if(!pr)return;
	if(pr.matches(sel)){
		el= pr;
    }else{
        return pr.next(sel);
    }
    return el;
}