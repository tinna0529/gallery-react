require('normalize.css/normalize.css');
require('styles/App.less');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片相关的数据
var imageDatas = require('../data/imageDatas.json');

//利用自执行函数,将图片名信息转成图片URL路径信息
imageDatas = (function genImageURL(imageDatasArr) {
  for(let i=0,len=imageDatasArr.length; i<len; i++){
    var singleImageData = imageDatasArr[i];

    singleImageData.imageURL = require('../images/' +
        singleImageData.fileName);

    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

//获取区间内的一个随机值
function getRangeRandom(low , high) {
  return Math.ceil(Math.random() * (high - low) + low);
}

//获取 0-30度 之间的一个任意正负值
function get30DegRandom() {
  return ((Math.random() > 0.5 ? '':'-') +
      Math.ceil(Math.random() * 30));
}


var ImgFigure = React.createClass({

  /**
   * imgFigure 的点击处理函数
     */
  handleClick: function (event) {

      if(this.props.arrange.isCenter){
          this.props.inverse();
      }else{
          this.props.center();
      }
      event.stopPropagation();
      event.preventDefault();
  },
  render: function () {
    var styleObj = {};

    //如果props属性中指定了这张图片的位置,则使用
    if(this.props.arrange.pos){
        styleObj = this.props.arrange.pos;
    }

    //如果图片的旋转角度有值并且不为0,添加旋转角度
    if(this.props.arrange.rotate){
      (['MozTransform','msTransform','WebkitTransform','']).forEach(function (value) {
          styleObj[value] = 'rotate(' +
              this.props.arrange.rotate + 'deg)';
      }.bind(this));
    }

    //让中心图片不被其它图片覆盖
    if(this.props.arrange.isCenter){
        styleObj.zIndex = 11;
    }

    var imgFigureClassName = 'img-figure';
    imgFigureClassName += (this.props.arrange.isInverse ? ' is-inverse' : ' ');

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }
});

var ControllerUnit = React.createClass({
    handleClick : function (event) {

        //如果点击的是居中的图片,则翻转图片,否则居中图片
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }
        event.stopPropagation();
        event.preventDefault();
    },

    render : function () {
        var controllerUnitClassName = 'controller-unit';
        if(this.props.arrange.isCenter){
            controllerUnitClassName += ' is-center';
            if(this.props.arrange.isInverse){
                controllerUnitClassName += ' is-inverse';
            }
        }
        return (
            <span className={controllerUnitClassName} onClick={this.handleClick}></span>
        );
    }
});

var AppComponent = React.createClass({
  constant: {
    centerPos: {
      left: 0,
      right: 0
    },
    hPosRange: { //水平方向的取值范围
      leftSecX: [0,0],
      rightSecX: [0,0],
      y: [0,0]
    },
    vPosRange: { //垂直方向的取值范围
      x: [0,0],
      topY: [0,0]
    }
  },

  /**
   * 翻转图片
   * @param index 输入当前被执行的inverse操作的图片对应的图片信息数组的Index值
   * @return {Function} 这是一个闭包函数, 其内return一个真正待被执行的函数
   * */
  inverse : function (index) {
      return function () {
          var imgsArrangeArr = this.state.imgsArrangeArr;
          imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
          this.setState({
              imgsArrangeArr : imgsArrangeArr
          });
      }.bind(this);
  },

  /**
   * 利用rearrange函数,居中对应Index的图片
   * @param index, 需要被居中的图片对应的图片信息数组的Index值
   * @return {Function}
     */
  center : function (index) {
      return function () {
         this.rearrange(index);
      }.bind(this);
  },

  /**
   * 重新布局所有图片
   * @param centerIndex, 指定居中排布centerIndex图片
   * @return null
     */
  rearrange: function (centerIndex) {
    var imgsArrangeArr = this.state.imgsArrangeArr,
        constant = this.constant,
        centerPos = constant.centerPos,
        hPosRange = constant.hPosRange,
        vPosRange = constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2), //上侧区域放置0-1个图片
        topImgSpliceIndex = 0,

        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

    //首先居中 centerIndex 图片, 居中的 centerIndex 图片不需要旋转
    imgsArrangeCenterArr[0] = {
        pos: centerPos,
        rotate: 0,
        isInverse : false,
        isCenter : true
    };

    //取出要布局上侧的图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() *
      (imgsArrangeArr.length-topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function (value,index) {
        imgsArrangeTopArr[index] = {
            pos : {
               top: getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
               left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
             },
            rotate : get30DegRandom(),
            isInverse : false,
            isCenter : false
        }
    })

    //布局左右两侧的图片
    for( let i=0, len=imgsArrangeArr.length, k=len/2; i<len ; i++){
      var hPosRangeLoRX = null;
      //前半部分布局左边,后半部分布局右边
      if(i < k){
          hPosRangeLoRX = hPosRangeLeftSecX;
      }else{
          hPosRangeLoRX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i] = {
          pos : {
              top: getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
              left: getRangeRandom(hPosRangeLoRX[0],hPosRangeLoRX[1])
          },
          rotate : get30DegRandom(),
          isInverse : false,
          isCenter : false
      }
    }
    //debugger; 可以添加调试信息

    //合并为imgsArrangeArr
    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
        imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }
    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);
    this.setState({
        imgsArrangeArr: imgsArrangeArr
    })
  },

  getInitialState : function () {
    return {
      imgsArrangeArr:[
        /*{
            pos: {
                left : '0',
                top : '0'
            },
            rotate: 0,          //旋转角度
            isInverse: false,    //图片正反面
            isCenter: false
         }*/
      ]
    };
  },

  //组件加载以后,为每张图片计算其位置的范围
  componentDidMount: function () {
    //首先,拿到舞台的大小
    var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //拿到一个imageFigure的大小
    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    //计算左侧,右侧图片排布位置的取值范围
    this.constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }
    this.constant.hPosRange.leftSecX[0] = -halfImgW;
    this.constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.constant.hPosRange.y[0] = -halfImgH;
    this.constant.hPosRange.y[1] = stageH - halfImgH;

    //计算上侧图片排布位置的取值范围
    this.constant.vPosRange.topY[0] = -halfImgH;
    this.constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.constant.vPosRange.x[0] = halfStageW - imgW;
    this.constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  },

  render: function () {

    var controllerUnits = [],
        imgFigures = [];

    imageDatas.forEach(function (value,index) {
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos: {left: 0, top: 0},
          rotate : 0,
          isInverse : false,
          isCenter: false
        }
      }
      imgFigures.push(<ImgFigure key={index} ref={'imgFigure'+index} data={value}
                                 inverse={this.inverse(index)} center={this.center(index)}
                                 arrange={this.state.imgsArrangeArr[index]}/>);
      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]}
              inverse={this.inverse(index)} center={this.center(index)}/>);
    }.bind(this));

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
});

AppComponent.defaultProps = {
};

export default AppComponent;
