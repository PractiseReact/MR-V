<!--编辑器中粘贴显示图片-->
<!--
    参考：
    https://www.zhangxinxu.com/study/201809/ajax-upload-image-from-clipboard-by-paste.php
    https://www.zhangxinxu.com/study/201109/html5-file-image-ajax-upload.html
-->
<template>
  <div>
    <div id="preview"></div>
    <p id="log"></p>
  </div>
</template>
<script>
export default {
  data() {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      document.addEventListener("paste", function (event) {
        var items = (event.clipboardData || window.clipboardData).items;
        var file = null;
        if (items && items.length) {
          // 搜索剪切板items
          for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              file = items[i].getAsFile();
              break;
            }
          }
        } else {
          log.innerHTML = '<span style="color:red;">当前浏览器不支持</span>';
          return;
        }
        if (!file) {
          log.innerHTML = '<span style="color:red;">粘贴内容非图片</span>';
          return;
        }
        // 此时file就是我们的剪切板中的图片对象
        // 如果需要预览，可以执行下面代码
        var reader = new FileReader();
        reader.onload = function (event) {
          preview.innerHTML = '<img src="' + event.target.result + '" class="upload-image">';
        };
        reader.readAsDataURL(file);
        // 如果不需要预览，上面这段可以忽略

        // 这里是上传
        var xhr = new XMLHttpRequest();
        // 上传进度
        if (xhr.upload) {
          xhr.upload.addEventListener(
            "progress",
            function (event) {
              log.innerHTML = "正在上传，进度：" + Math.round((100 * event.loaded) / event.total) / 100 + "%";
            },
            false
          );
        }
        // 上传结束
        xhr.onload = function () {
          var responseText = xhr.responseText;
          log.innerHTML = "上传成功，地址是：" + responseText;
        };
        xhr.onerror = function () {
          log.innerHTML = '<span style="color:red;">网络异常，上传失败</span>';
        };
        xhr.open("POST", "./upload.php", true);
        xhr.setRequestHeader("FILENAME", encodeURIComponent(file.name));
        xhr.send(file);
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>
