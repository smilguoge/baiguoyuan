//index.js
//获取应用实例
const app = getApp()
var QQMapWX = require('../libs/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'YGSBZ-QANC4-M2YUA-X2HI3-5AT6Q-JEBIJ' // 必填
});

Page({
  data: {
    address:"厦门市软件园二期",
    shopname:"瑞景店",
    money:"***",
    coupon: "***",
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2500,
    duration: 500,
    title1:"店长点赞",
    goodpro:{},
    page:1,
    limit:10,
    bannerUrls: [
      {
        url: '../images/banner1.png',
        linkUrl: '../myinfo/index'
      },
      {
        url: '../images/banner2.png',
        linkUrl: '../member/index'
      },
      {
        url: '../images/banner3.png',
        linkUrl: '../order/index'
      }
      ]

  },

gosearch(){
  wx.navigateTo({
    url: "/pages/search/index"
  })
},
getnearshop(){
  const that = this
  wx.request({
    url: wx.getStorageSync('config').nearshop_url,
    header: wx.getStorageSync('header'),
    success(res) {
      wx.hideToast()
      if (res.data.code == 200) {
        let shop = res.data.data.shoplist
        let nearshop = [], shoplist = []
        let mindisc
        shop.forEach((item,index)=> {
          let s = that.distance(that.data.myLatitude, that.data.myLongitude, item.latitude, item.longitude)
          if (index == 0 || mindisc > s) {
            mindisc = s
            shoplist=item
            
          }
        })
        that.setData({
          shopname: shoplist.shopname
        })
        app.globalData.shopname = shoplist.shopname
        console.log(app.globalData.shopname)
        console.log("hopname")

      } else {
        let mess = res.data.message
        wx.showToast({
          title: mess,
          icon: 'success',
          duration: 2000
        })
      }
    },
    fail(){}
  })
},
gonearshop(){
    wx.navigateTo({
      url: "/pages/changeshop/index?myLatitude=" + this.data.myLatitude + "&myLongitude=" + this.data.myLongitude + "&shopname=" + this.data.shopname
    })
  },
gopeisong(){
    wx.navigateTo({
      url: "/pages/peisong/index"
    })
  },
  //事件处理函数
gethotlist(){
  const that=this
  wx.request({
    url: wx.getStorageSync('config').tjproduct_url,
    data:{
      shopname: that.data.shopname
    },
    success(res){
      if(res.data.code=200){
        let hospro = res.data.data.list
        hospro.forEach(item=>{
          if (item.name.length>16){
            item.name = item.name.substring(0, 18) + '...'
          }
        })
        that.setData({
          hotpro:hospro
        })
      }else{
        let mess = res.data.message
        wx.showToast({
          title: mess,
          icon: 'error',
          duration: 2000
        })
      }

    },
    fail(){}
  })
},
  getgoodlist() {
    const that = this
    wx.request({
      url: wx.getStorageSync('config').yxproductlist_url,
      data: {
        shopname: that.data.shopname,
        page: that.data.page,
        limit: that.data.limit,
        shopname: that.data.shopname
      },
      success(res) {
        if (res.data.code = 200) {
          let goodpro = res.data.data
          goodpro.forEach(item => {
            if (item.name.length > 16) {
              item.name = item.name.substring(0, 18) + '...'
            }
          })
          that.setData({
            goodpro: [...that.data.goodpro, ...goodpro],
            total:res.data.total
          })
        } else {
          let mess = res.data.message
          wx.showToast({
            title: mess,
            icon: 'error',
            duration: 2000
          })
        }

      },
      fail() { }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that=this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          myLatitude: res.latitude,
          myLongitude: res.longitude
        })
        that.getPoiList(res.longitude, res.latitude)
        that.gethotlist()
        that.getgoodlist()
        that.getnearshop()
      }
    })

  },

  imgHeight: function (e) {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var imgh = e.detail.height;//图片高度
    var imgw = e.detail.width;//图片宽度
    var swiperH = winWid * imgh / imgw + "px"
    this.setData({
      Height: swiperH//设置高度
    })
    },
  getPoiList(longitude, latitude) {
    let that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      get_poi: 1,
      poi_options: 'policy=2;radius=3000;page_size=2;page_index=1',
      success: function (res) {
        /**
         * 详细数据从这儿拿....
         */
        that.setData({
          address: res.result.pois[0].title
        });
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    });
  },
    /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const that=this
    let token = wx.getStorageSync('token')
    if(token){
      wx.request({
        url: wx.getStorageSync('config').member_url,
        header: wx.getStorageSync('header'),
        data:{
          token: token
        },
        success(res){
          console.log(res)
          if(res.data.code=200){
            that.setData({
              coupon: res.data.coupon,
              money: res.data.money
            })
          }else{
            let mess=res.data.message
            wx.showToast({
              title: mess,
              icon:'error',
              duration:2000
            })
          }
        },
        fail(){}
      })
    }

  },
  distance(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if ((app.globalData.shopname !== '')&& (this.data.shopname != app.globalData.shopname)){
            this.setData({
              shopname: app.globalData.shopname
            })
            this.gethotlist()
            this.getgoodlist()
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {


  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const that = this
    if (that.data.goodpro.length == that.data.total) {
      wx.showToast({
        title: '没有更多',
        icon: 'success',
        duration: 2000
      })
    } else {
      this.setData({
        page: this.data.page + 1
      })
      this.getgoodlist()
    }

  }
})
