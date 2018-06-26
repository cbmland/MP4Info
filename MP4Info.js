/**
 * 
 * buffer转字符
 * @param {bytes} buffer 一个buffer 
 * @param {number} offset 位移
 * @param {numer} length 结束位移
 */
const bufferToString =(buffer,offset,length)=>{
    
    var utf8 = new Uint8Array(buffer,offset,length);
    offset = offset === undefined ? 0:offset;
    length = length === undefined ? buffer.byteLength:length
    return String.fromCharCode.apply(null, utf8)
     
}
/**
 * buffer转64uint
 * @param {bytes} bytes 
 * @param {true} isSigned 
 */
const  BufferToUint64 =(bytes, isSigned) =>{
    var d = new DataView(bytes)
    var _a = d.getUint32(0)
    var _b = d.getUint32(4)
    var ta =  _a & 0x7FFFFFFF; 
    if(0 != (0x80000000 & _a)){
        return  (0x100000000 * ta  + _b)*-1; 
    } 
    return  0x100000000 * ta + _b;
}
/**
 * 取出Mp4 Box数据
 * @param {*} dataView  DavaView 
 * @param {*} offset 位移
 */
const getBox = (dataView,offset= 0) =>
{
    
    let size,type,is64Bit,isUUID,headerLength,data

    size = dataView.getUint32(offset);      
    type = bufferToString(dataView.buffer,dataView.byteOffset+offset+4,4);
     is64Bit = size == 1;
     isUUID = type =="uuid";
    if (is64Bit) 
    {
        let s = offset+8
        var buf = dataView.buffer.slice(s,s+8)        
        size = BufferToUint64(buf,true) 
        
    } 
    headerLength = (is64Bit?8:0)+(isUUID?128:0)+8 
    data = new DataView(dataView.buffer,dataView.byteOffset+offset, size)
    return {type,size,headerLength,data}; 
}
/**
 * 取出双位数据 【x+x】
 * @param {*} dataView buffer
 * @param {*} offset 位移
 * @param {*} type getint8,getInt16...
 * @param {*} u 间隔位移
 */
const getValue = (dataView,offset,type,u)=>{
    var a = dataView[type](offset)
    offset+= u;
    var b = dataView[type](offset)
    return a + b;
}
/**
 * 取出box
 * @param {*} boxs 一个box的Array
 * @param {*} type type 相应的type
 */
const getBoxName = (boxs,type)=>{
    
        let result 
        boxs.map(box =>{
       
            if (type ==box.type)
            {
                result = box
            }


        })
        return result;
       
  
}
/**
 * 从一个buffer或box取出box列表
 * {data:new DataView(buffer),offset:0,headerLength:0,size:box.byteLength,type:type}
 * @param {Box} box 一个buffer或box
 */
const getBoxs = (box) =>{
 
    try{
        let boxs,offset,_box;
        _box = box;
        /**
         * 判断box is ArrayBuffer,如果是ArrayBuffer，创建一个box数据;
         */
        if (box instanceof ArrayBuffer){
          
            _box = {data:new DataView(box),offset:0,headerLength:0,size:box.byteLength,type:"root"}
        }
        /**
         * 位移位置去掉头部length,type的长度
         */
        offset = _box.headerLength; 
        boxs =[]
        while(true)
        {
            /**
             * 取出box列表。
             * subBox.data:该box的dataView
             * subbox.offset 位移
             * subBox.headerLength 头部length,type的长度
             * subBox.size box的数据长度，与subBox.data.byteLength一致
             * subBox.type box的类型
             */
           var subBox =  getBox(_box.data,offset);
           /**
            * 去掉box的长度，下次循环
            */
           offset += subBox.size; 
           boxs.push(subBox)  
        /**
         * 
         * offset等于box的长度，退出循环
         */
        if (offset == _box.size) 
            break;
            
        }  
   
        return boxs
    }catch(e)
    {
       return 
    }
    
    

     

} 
/**
 * https://blog.csdn.net/yu_yuan_1314/article/details/9379271
 * mp4Box Type
 * ==========================================================================================
 * ftyp |    |     |           |file type and compatibility
 * moov |    |     |           |container for all the metadata
 * -----|trak|     |           |track header, overall information about the track
 * -----|----|mdia |           |container for the media information in a track
 * -----|----|hdlr |           |handler, declares the media (handler) type
 * 
 * @param {*} buffer 
 */

const getMediaInfo =(buffer)=>{
    var result = {},duration
   var moovs =  getBoxs(getBoxName(getBoxs(buffer),"moov"));
    moovs.map(trak=>{
        
        if (trak.type =="mvhd")
        {
            var start =trak.headerLength
            var version = trak.data.getUint8(start)

            start += (version == 1?16:8)+4;
            var t = trak.data.getUint32(start)
            var d = trak.data.getUint32(start+4)
            duration =(d/t)
            
        }
        if(trak.type == "trak")
        {
           
            var boxs = getBoxs(trak)
            var mdia = getBoxName(boxs,"mdia")
            var mdiaList =getBoxs(mdia)
          
            var hdlr = getBoxName(mdiaList,"hdlr");
            
          



 
            /** 
             * 判断trak->mdia->hdlr是否视频
             */
            if( bufferToString( hdlr.data.buffer, hdlr.data.byteOffset+16,4) == "vide")
            {
               
                var minf = getBoxName(mdiaList,"minf");
                var mdhd = getBoxName(mdiaList,"mdhd");
                var minfList = getBoxs(minf)
                var stbl = getBoxName(minfList,"stbl");
                var stblList =getBoxs(stbl)
                var stts = getBoxName(stblList,"stts");
                var tkhd = getBoxName(boxs,"tkhd");  
                var count = stts.data.getUint32(stts.headerLength+4);
                var sttsSample = []                
                var s = stts.headerLength+8;
                for (var i=0;i<count;i++)
                {
                      sttsSample[i] = {}
                     sttsSample[i].timescale = stts.data.getUint32(s+i*4);
                    sttsSample[i].   duration = stts.data.getUint32(s+i*4+4);
                } 
                /**
                 * 计算fps
                 */
                var _timescale = mdhd.data.getUint32(mdhd.headerLength+12)

                let offset = tkhd.data.byteLength-44;
                let rotation = Math.atan2(tkhd.data.getInt32(offset+4),tkhd.data.getInt32(offset)) * 180/Math.PI  
                let width = getValue(tkhd.data,offset+36,"getInt16",2)
                let height =  getValue(tkhd.data,offset+40,"getInt16",2)                
                
                result = {rotation,width,height,fps:_timescale/sttsSample[0].duration,duration} ; 

                
            }      
        }
    })
  
  return result;

}
export 
{
   
    getMediaInfo
}  
