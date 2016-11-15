/**
 * Created by zhouxiong on 16/11/15.
 */

define(['drag-upload'], function (dragUpload) {

    //给拖拽div注册事件
    var el = document.getElementById('drag-upload');
    var showEl = document.getElementById('img-list');
    dragUpload.dragUpload(el, showEl);

});




