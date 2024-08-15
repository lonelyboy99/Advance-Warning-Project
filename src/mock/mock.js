import Mock from 'mockjs'
//延时200-600毫秒请求到数据
Mock.setup({
    timeout: '200-600'
})

const Random = Mock.Random;
// 用户总览
function countUserNum() {
    const a = Mock.mock({
        success: true,
        data: {
            offlineNum:'@integer(1, 100)',
            lockNum: '@integer(1, 10)',
            totalNum:218
        }
    })
    a.data.onlineNum=a.data.totalNum-a.data.offlineNum-a.data.lockNum
    return a
}

// 接口，第一个参数url，第二个参数请求类型，第三个参数响应回调
Mock.mock(new RegExp('countUserNum'), 'get', countUserNum)

// /设备总览 

function countDeviceNum() {
    const a = Mock.mock({
        success: true,
        data: {
            alarmNum: '@integer(100, 1000)',
            offlineNum: '@integer(0, 50)',
            totalNum:698
        }
    })
    a.data.onlineNum=a.data.totalNum-a.data.offlineNum


    return a
}

Mock.mock(new RegExp('countDeviceNum'), 'get', countDeviceNum)

// /设备总览 

function sbtx() {
    const a = Mock.mock({
        success: true,
        data: {
            "list|20": [
                {
                    provinceName: "@province()",
                    cityName: '@city()',
                    countyName: "@county()",
                    createTime: "@datetime('yyyy-MM-dd HH:mm:ss')",
                    deviceId: "6c512d754bbcd6d7cd86abce0e0cac58",
                    "gatewayno|+1": 10000,
                    "onlineState|1": [0, 1],

                }
            ]
        }
    })
    return a
}

Mock.mock(new RegExp('sbtx'), 'get', sbtx)



//中间地图

function centermap(options) {
    let params = parameteUrl(options.url);

    // 明确指定南京市的区名称
    const nanjingDistricts = [
        "玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区",
        "雨花台区", "江宁区", "六合区", "溧水区", "高淳区"
    ];

    // 生成南京市的区数据
    const dataList = nanjingDistricts.map(district => ({
        name: `${district}`,
        value: Mock.mock('@integer(1, 1000)')
    }));

    const response = Mock.mock({
        success: true,
        data: {
            dataList: dataList,
            regionCode: '320100',
        }
    });

    console.log('Generated Nanjing District Data:', response);
    return response;
}


Mock.mock(new RegExp('centermap'), 'get', centermap);


// 报警次数

function alarmNum() {
    const a = Mock.mock({
        success: true,
        data: {
            dateList:['2023-7', '2023-8', '2023-9', '2023-10', '2023-11',"2023-12"],
            "numList|6":[
                '@integer(0, 100)'
            ],
            "numList2|6":[
                '@integer(0, 100)'
            ]
        }
    })
    return a
}
Mock.mock(new RegExp('alarmNum'), 'get', alarmNum)

// 实时预警

function ssyj() {
    const a = Mock.mock({
        success: true,
        data: {
            "list|40":[{
                alertdetail: "@csentence(5,10)",
                "alertname|1": ["水浸告警","各种报警"],
                alertvalue: "@float(60, 200)",
                createtime: "2022-04-19 08:38:33",
                deviceid: null,
                "gatewayno|+1": 10000,
                phase: "A1",
                sbInfo: "@csentence(10,18)",
                "terminalno|+1": 100,
                provinceName: "@province()",
                cityName: '@city()',
                countyName: "@county()",
            }],

        }
    })
    return a
}
Mock.mock(new RegExp('ssyj'), 'get', ssyj)

//图表展示
function installationPlan() {
    // 获取当前日期
    const currentDate = new Date();

    // 构造最近 27 天的日期数组
    const dateArray = [];
    for (let i = 26; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        dateArray.push(formattedDate);
    }

    // Mock 数据
    const a = Mock.mock({
        category: dateArray,
        "barData|27": ["@integer(10, 100)"],
    });

    // 计算 lineData 和 rateData
    let lineData = [],
        rateData = [];
    for (let index = 0; index < a.barData.length; index++) {
        let lineNum = Mock.mock('@integer(0, 100)') + a.barData[index];
        lineData.push(lineNum);
        let rate = a.barData[index] / lineNum;
        rateData.push((rate * 100).toFixed(0));
    }

    a.lineData = lineData;
    a.rateData = rateData;

    return {
        success: true,
        data: a,
    };
}

Mock.mock(new RegExp('installationPlan'), 'get', installationPlan);






//报警排名 
function ranking() {
   //多生成几个避免重复 重复会报错
  let num =Mock.mock({"list|48":[{ value:"@integer(50,1000)",name:"@city()"}]}).list
//   console.log(num);
  let newNum =[],numObj={}
  num.map(item=>{
    if(!numObj[item.name] && newNum.length<8){
        numObj[item.name] =true
        newNum.push(item)
    }
  })
  let arr = newNum.sort((a,b)=>{
    return b.value-a.value
  })
  let a ={
      success:true,
      data:arr
  }
  return a
}
Mock.mock(new RegExp('ranking'), 'get', ranking)

/**
 * @description: min ≤ r ≤ max  随机数
 * @param {*} Min
 * @param {*} Max
 * @return {*}
 */
function RandomNumBoth(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
}
/**
 * @description: 获取路径参数
 * @param {*} url
 * @return {*}
 */
function parameteUrl(url) {
    var json = {}
    if (/\?/.test(url)) {
        var urlString = url.substring(url.indexOf("?") + 1);
        var urlArray = urlString.split("&");
        for (var i = 0; i < urlArray.length; i++) {
            var urlItem = urlArray[i];
            var item = urlItem.split("=");
            console.log(item);
            json[item[0]] = item[1];
        }
        return json;
    }
    return {};
}
