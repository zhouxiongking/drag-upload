/**
 * Created by zhouxiong on 16/11/15.
 */

define(function () {

    /**
     * 阻止document的默认行为
     */
    function preventDocument() {
        document.addEventListener('dragenter', function (e) {
            e.preventDefault();
        });

        document.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        document.addEventListener('dragleave', function (e) {
            e.preventDefault();
        });

        document.addEventListener('drop', function (e) {
            e.preventDefault();
        });
    }

    var dragUpload = function (el, showEl) {

        //1.首先阻止document的默认行为
        preventDocument();

        //2.给el绑定拖拽事件
        //2.1 拖拽进指定区域
        el.addEventListener('dragenter', function (e) {
            e.preventDefault();
            el.className = el.className + ' drag-enter';
        });
        el.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        //2.2 离开拖拽区域
        el.addEventListener('dragleave', function (e) {
            e.preventDefault();
            el.className = el.className.replace(' drag-enter', '');
        });

        //2.3 拖拽区域内结束
        el.addEventListener('drop', function (e) {
            //要加这句话,阻止默认行为,要不然在拖动文件的时候会默认为预览文件内容
            e.preventDefault();
            el.className = el.className.replace(' drag-enter', '');
            //获取拖拽文件列表
            var files = e.dataTransfer.files;
            if (!files.length) {
                return false;
            }
            if (files.length > 6) {
                alert('一次最多上传6个文件');
                return false;
            }
            var flag = false;
            for (var i = 0; i < files.length; i++) {
                var size = Math.floor(files[i].size / 1024 / 1024);
                if (size > 1) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                console.log('每个文件最大为1M');
                return false;
            }

            //满足条件后,将图片缩略图现实在拖拽区域中
            Array.prototype.map.call(files, function (file) {
                var img = document.createElement('img');
                if (window.URL) {
                    var src = window.URL.createObjectURL(file);
                    img.src = src;
                    el.appendChild(img);
                } else {
                    img.file = file;
                    el.appendChild(img);

                    var reader = new FileReader();
                    reader.onload = (function (aImg) {
                        return function (evt) {
                            aImg.src = evt.target.result;
                        }
                    })(img);
                    reader.readAsDataURL(file);
                }
            });

            //处理完后自动上传
            for (var i = 0; i < files.length; i++) {
                var xhr = new XMLHttpRequest();
                var formData = new FormData();
                formData.append('file', files[i]);
                formData.append('filename', files[i].name);

                xhr.open('POST', '/upload', true);
                xhr.send(formData);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        console.log(xhr.responseText);
                        //将上传图片显示在已上传的div中
                        var xhr2 = new XMLHttpRequest();
                        xhr2.open('GET', '/load', true);
                        xhr2.send();
                        xhr2.onreadystatechange = function () {
                            if (xhr2.readyState == 4 && xhr2.status == 200) {
                                var imgList = JSON.parse(xhr2.responseText);
                                showEl.innerHTML = '';
                                imgList.forEach(function (item) {
                                    var img = document.createElement('img');
                                    img.src = item.image_url;
                                    showEl.appendChild(img);
                                });
                            }
                        }
                    }
                }
            }
        });
    };

    return {
        dragUpload: dragUpload
    }
});
