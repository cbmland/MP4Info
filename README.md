# # MP4Info

#### 项目介绍

基于Web获取视频文件基础信息工具类，快速获取视频文件的 rotation\width\height\fps\duration 基本信息


#### 使用说明

        <script src="js/mmd.local.min.js"></script>
        <script>
            files.addEventListener("change",function(e){
               
                var f = new FileReader();
                f.onload =function()
                {
                    var info = MMD.mp4.getMediaInfo(f.result)
                    console.log(JSON.stringify(info))
                    //{"rotation":90,"width":1920,"height":1080,"fps":30,"duration":10.24}
                }
                f.readAsArrayBuffer(e.target.files[0])
            })
    
        </script>


#### 参与贡献

1. lennylin 参与本项目Coding
