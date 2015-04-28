;
(function (angular, $, _, console) {
    var moduleName = 'quicksilver.controller';
    var controllerName = "notebookListCtrl";

    angular.module(moduleName)
        .controller(controllerName,[
            '$scope', '$rootScope', '$element', '$q', 'notebookListSvc', 'quicksilverModelSvc', '$timeout',
            function($scope, $rootScope, $element, $q, notebookListSvc, quicksilverModelSvc, $timeout) {

                $scope.notebookList = [];
                $scope.notebookListIndex = -1;

                /**
                 * 새로운 노트북을 추가한다.
                 */
                $scope.newNotebook = function () {
                    var newNotebook = quicksilverModelSvc.createNoteBook();
                    notebookListSvc.addNoteBook(newNotebook)
                        .success(function (data, status) {
                            $scope.notebookList.unshift(quicksilverModelSvc.copyNoteBook(data.data));
                            $scope.selectNotebook(0);
                        })
                        .error(function (data, status) {
                            console.error(status);
                        });
                };

                /**
                 * 메뉴가 보일때
                 * @param $index
                 */
                $scope.showContextMenu = function ($index) {
                    $scope.notebookListIndex = $index;

                    // 마지막 요소인지 검사한다.
                    if ( $index+1 === $scope.notebookList.length ) {
                        $("#notebook-contextmenu")
                                .find("li")
                                .hide()
                            .end()
                                .find("li")
                                .last()
                                .show();
                    } else {
                        $("#notebook-contextmenu")
                                .find("li")
                                .show()
                            .end()
                                .find("li")
                                .last()
                                .hide();
                    }
                };

                /**
                 * 메뉴가 숨을때
                 * @param $index
                 */
                $scope.hideContextMenu = function ($index) {
                };

                $scope.selectNotebook = function ($index, note) {
                    if ( $scope.notebookListIndex === $index) {
                        _.each($scope.notebookList, function (val, idx) {
                            if ( $index === idx ) {
                                val.isFocus = true;
                            } else {
                                val.isFocus = false;
                                val.isModify = false;
                            }
                        });
                    }
                    $scope.notebookListIndex = $index;
                    var currnetNotebook = $scope.notebookList[$index];
                    $rootScope.$broadcast("noteListCtrl:selectNotebook", currnetNotebook, note);
                };

                /**
                 * input keypress
                 * @param $event
                 * @param $index
                 */
                $scope.keyPress = function ($event, $index) {
                    if ( $event.which === 13 ) {
                        $scope.notebookListIndex = $index;
                        var currentNotebook = $scope.notebookList[$scope.notebookListIndex];

                        notebookListSvc.addNoteBook(currentNotebook)
                            .success(function (data, status) {
                                $scope.notebookList[$scope.notebookListIndex] = quicksilverModelSvc.copyNoteBook(data.data);

                                $scope.notebookList[$scope.notebookListIndex].isModify = false;
                                $scope.selectNotebook($scope.notebookListIndex);
                            })
                            .error(function (data, status) {
                                console.error(status);
                            });
                    }
                };

                /**
                 * input bulr
                 * @param $event
                 * @param $index
                 */
                $scope.titleBulr = function ($event, $index) {
                    var currentNotebook = $scope.notebookList[$index];

                    if (currentNotebook.id !== 0 ) {
                        notebookListSvc.addNoteBook(currentNotebook)
                            .success(function (data, status) {
                                $scope.notebookList[$index] = quicksilverModelSvc.copyNoteBook(data.data);
                                $scope.notebookList[$index].isFocus = false;
                                $scope.notebookList[$index].isModify = false;
                            })
                            .error(function (data, status) {
                                console.error(status);
                            });
                    }
                };

                /**
                 * input dblclick
                 * @param $index
                 */
                $scope.dblClickTtile = function ($index) {
                    $scope.notebookListIndex = $index;
                    if ( $scope.notebookList.length-1 === $scope.notebookListIndex ) {
                        $scope.notebookList[$index].isFocus = true;
                        $scope.notebookList[$index].isModify = false;
                    } else {
                        $scope.notebookList[$index].isFocus = true;
                        $scope.notebookList[$index].isModify = true;
                    }

                    $timeout(function () {
                        $("#notebook-title-" + $index).trigger("select");
                    }, 0);
                };

                $scope.$on(controllerName + ":renameNotebook", function (e) {
                    $scope.notebookList[$scope.notebookListIndex].isFucos = true;
                    $scope.notebookList[$scope.notebookListIndex].isModify = true;

                    $timeout(function () {
                        $("#notebook-title-" + $scope.notebookListIndex).trigger("select");
                    }, 0);
                });

                $scope.$on(controllerName + ":deleteNotebook", function (e) {
                    var currentNotebook = $scope.notebookList[$scope.notebookListIndex];
                    notebookListSvc.deleteNoteBook(currentNotebook)
                        .then(function (result) {
                            $scope.notebookList.splice($scope.notebookListIndex, 1);
                            $scope.selectNotebook(0);

                            return notebookListSvc.getTrashNoteList();
                        }, function (data, status) {
                            console.error(status);
                        })
                        .then(function (result) {
                            $scope.notebookList[$scope.notebookList.length-1] = quicksilverModelSvc.copyNoteBook({
                                title: 'Trash',
                                noteCnt: result.data.data.length,
                                isModify: false
                            });
                            // 첫번째 노트북을 선택해 준다.
                            $scope.selectNotebook(0);
                        }, function (data, status) {
                            console.error(status);
                        });
                });

                $scope.$on(controllerName + ":emptyTrash", function (e) {
                    notebookListSvc.deleteTrashNoteList()
                        .success(function (data, status) {
                            $scope.notebookList[$scope.notebookList.length-1].noteCnt = 0;
                            $scope.selectNotebook($scope.notebookList.length - 1);
                        })
                        .error(function (data, status) {
                            console.error(status);
                        });
                });

                $scope.$on(controllerName + ":addNoteCnt", function (e, noteCnt) {
                    $scope.notebookList[$scope.notebookList.length-1].noteCnt += noteCnt;
                });

                $scope.$on(controllerName + ":selectNoteBook", function (e, note) {
                    var index = -1;
                    _.each($scope.notebookList, function(val, idx) {
                        if (val.id === note.notebook ) {
                            index = idx;
                        }
                    });
                    $scope.selectNotebook(index, note);
                });

                $scope.$watch('notebookListIndex', function (newValue, oldValue) {
                    if ( 0 <= newValue && newValue < $scope.notebookList.length) {
                        _.each($scope.notebookList, function (val, idx) {
                            if ( newValue === idx ) {
                                val.isFocus = true;
                            } else {
                                val.isFocus = false;
                                val.isModify = false;
                            }
                        });
                    }
                });


                /**
                 * 초기화
                 */
                $q.all([notebookListSvc.getNoteBookList(), notebookListSvc.getTrashNoteList()])
                    .then(function (resultArray) {
                        _.each(resultArray[0].data.data, function (val, idx) {
                            $scope.notebookList.push(quicksilverModelSvc.createNoteBook(val));
                        });
                        $scope.notebookList.push(quicksilverModelSvc.createNoteBook({
                            title: 'Trash',
                            noteCnt: resultArray[1].data.data.length,
                            isModify: false
                        }));

                        // 첫번째 노트북을 선택해 준다.
                        $scope.selectNotebook(0);
                    });
        }])
        .controller('notebookContextMenuCtrl', [
            '$scope', '$rootScope', '$element',
            function($scope, $rootScope, $element) {
                $scope.renameNotebook = function () {
                    $rootScope.$broadcast(controllerName + ":renameNotebook");
                    $element.removeClass("open");
                };

                $scope.deleteNotebook = function () {
                    $rootScope.$broadcast(controllerName + ":deleteNotebook");
                    $element.removeClass("open");
                };

                $scope.emptyTrash = function () {
                    $rootScope.$broadcast(controllerName + ":emptyTrash");
                    $element.removeClass("open");
                };
            }]);
})(angular, jQuery, _, window.console&&window.console||{
    log: function() {},
    debug: function() {},
    info: function() {},
    warning: function() {},
    error: function() {}
});

