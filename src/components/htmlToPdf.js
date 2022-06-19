// 批量自定义全局函数
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  install(Vue, options) {
    // id-导出pdf的div容器；title-导出文件标题
    Vue.prototype.htmlToPdf = (name, title) => {
      const element = document.querySelectorAll(`.${name}`)
      let count = 0
      const PDF = new JsPDF('', 'pt', 'a4')
      const pageArr = []
      const opts = {
        scale: 12, // 缩放比例，提高生成图片清晰度
        useCORS: true, // 允许加载跨域的图片
        allowTaint: false, // 允许图片跨域，和 useCORS 二者不可共同使用
        tainttest: true, // 检测每张图片已经加载完成
        logging: true // 日志开关，发布的时候记得改成 false
      }
      for (const index in Array.from(element)) {
        html2Canvas(element[index], opts).then(function(canvas) {
          // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
          const contentWidth = canvas.width
          const contentHeight = canvas.height
          const imgWidth = 595.28
          const imgHeight = (592.28 / contentWidth) * contentHeight
          const pageData = canvas.toDataURL('image/jpeg', 1.0)
          // 一页pdf显示html页面生成的canvas高度;
          const pageHeight = (contentWidth / 592.28) * 841.89
          // 未生成pdf的html页面高度
          const leftHeight = contentHeight
          pageArr[index] = { pageData: pageData, pageHeight: pageHeight, leftHeight: leftHeight, imgWidth: imgWidth, imgHeight: imgHeight }
          if (++count === element.length) {
            // 转换完毕，可进行下一步处理 pageDataArr
            let counts = 0
            for (const data of pageArr) {
              // 页面偏移
              let position = 0
              // 转换完毕，save保存名称后浏览器会自动下载
              // 当内容未超过pdf一页显示的范围，无需分页
              if (data.leftHeight < data.pageHeight) {
                // addImage(pageData, 'JPEG', 左，上，宽度，高度)设置
                PDF.addImage(data.pageData, 'JPEG', 0, 0, data.imgWidth, data.imgHeight)
              } else {
                // 超过一页时，分页打印（每页高度841.89）
                while (data.leftHeight > 0) {
                  PDF.addImage(data.pageData, 'JPEG', 0, position, data.imgWidth, data.imgHeight)
                  data.leftHeight -= data.pageHeight
                  position -= 841.89
                  if (data.leftHeight > 0) {
                    PDF.addPage()
                  }
                }
              }
              if (++counts === pageArr.length) {
                PDF.save(title + '.pdf')
              } else {
                // 未转换到最后一页时，pdf增加一页
                PDF.addPage()
              }
            }
          }
        })
      }
    }
  }
}
