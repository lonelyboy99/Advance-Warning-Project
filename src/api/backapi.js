const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');


const app = express();
const port = 8888;

app.use(cors()); // 使用cors中间件

const db = mysql.createConnection({
    host: '139.224.230.205',
    user: 'power',
    password: 'cyh991103',
    database: 'power'
});

db.connect(err => {
    if (err) {
        console.error('数据库连接失败: ' + err.stack);
        return;
    }
    console.log('已连接到数据库');
});

app.get('/api/devices', (req, res) => {
    const limitNum = parseInt(req.query.limitNum, 10) || 20; // 获取limitNum参数

    // Format the createTime column using DATE_FORMAT or any other SQL formatting function
    const sql = `SELECT *, 
                        DATE_FORMAT(createTime, '%Y-%m-%d %H:%i:%s') AS createTime 
                 FROM devices 
                 LIMIT ${limitNum}`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({success: false, message: '数据库查询失败', error: err});
        }
        res.json({
            success: true,
            data: {
                list: results
            }
        });
    });
});

// app.get('/api/environment', (req, res) => {
//     const sql = 'SELECT temperature, humidity, lighting, power FROM environment_data ORDER BY timestamp DESC LIMIT 1';
//
//     db.query(sql, (err, results) => {
//         if (err) {
//             return res.status(500).json({success: false, message: '数据库查询失败', error: err});
//         }
//         res.json({
//             success: true,
//             data: results[0]
//         });
//     });
// });

// app.get('/api/figShow', (req, res) => {
//     const sql = `
//     SELECT date, bar_value AS barData, line_value AS lineData, rate_value AS rateData
//     FROM installation_plan
//     WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
//     ORDER BY date ASC
//   `;
//
//     db.query(sql, (err, results) => {
//         if (err) {
//             return res.status(500).json({success: false, message: '数据库查询失败', error: err});
//         }
//
//         // 格式化日期为 YYYY-MM-DD
//         const data = {
//             category: results.map(item => {
//                 const date = new Date(item.date);
//                 return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
//             }),
//             barData: results.map(item => item.barData),
//             lineData: results.map(item => item.lineData),
//             rateData: results.map(item => item.rateData.toFixed(0))
//         };
//
//         res.json({
//             success: true,
//             data: data
//         });
//     });
// });

app.get('/api/deviceError', (req, res) => {
    const sql = `
    SELECT 
      date,
      SUM(CASE WHEN errorType = '烟雾' THEN count ELSE 0 END) AS smokeCount,
      SUM(CASE WHEN errorType = '故障' THEN count ELSE 0 END) AS overloadCount,
      SUM(CASE WHEN errorType = '警报' THEN count ELSE 0 END) AS overtempCount
    FROM deviceError
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    GROUP BY date
    ORDER BY date ASC
  `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({success: false, message: '数据库查询失败', error: err});
        }

        const data = {
            category: results.map(item => {
                const date = new Date(item.date);
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            }),
            smokeCount: results.map(item => item.smokeCount),
            overloadCount: results.map(item => item.overloadCount),
            overtempCount: results.map(item => item.overtempCount)
        };

        res.json({
            success: true,
            data: data
        });
    });
});
// 地图修改
app.get('/api/regionCode', (req, res) => {
    const regionCode = req.query.regionCode;
    console.log(`Received request with regionCode: ${regionCode}`);

    // Nanjing City Code
    const query = `
      SELECT cityCode, COUNT(*) as device_count
      FROM devices
      GROUP BY cityCode
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            res.json({success: false, msg: 'Database query failed'});
            return;
        }
        if (results.length === 0) {
            console.log('No data found for regionCode:', regionCode);
            res.json({success: false, msg: 'No data found'});
        } else {
            console.log('Query results:', results);
            res.json({success: true, data: {dataList: results, regionCode}});
        }
    });
});

async function smokeGetAccessToken() {
    try {
        const response = await axios.post('https://admin.zhilianweishi.com/api/oauth/token', null, {
            headers: {
                'Authorization': 'Basic Y2xpZW50RnJvbnRFbmQ6c2VjcmV0',  // 固定值
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                grant_type: 'password',
                username: 'zl-api-d66',  // 您的账号
                password: '123456'       // 初始密码
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error('获取AccessToken时出错:', error.response ? error.response.data : error.message);
        throw new Error('获取AccessToken失败');
    }
}

async function detectorGetAccessToken() {
    try {
        const response = await axios.post('https://fire-api.htcxcloud.com/api/v1/account/login', {
            username: "17681391276",
            password: "cyh17681391276",
            clientType: "WEB",
            pid: "01967189376"
        }, {
            headers: {
                'Content-Type': "application/json"
            }
        });

        return response.data;
    } catch (error) {
        console.error('获取AccessToken时出错:', error.response ? error.response.data : error.message);
        throw new Error('获取AccessToken失败');
    }
}

app.get('/api/detectorGetAccessToken', async (req, res) => {
    try {
        const responseData = await detectorGetAccessToken();

        res.json(responseData);
    } catch (error) {
        // 如果获取 Access Token 失败，返回错误信息
        res.status(500).json({error: error.message});
    }
});

app.get('/api/smoke', async (req, res) => {
    try {
        const accessToken = await smokeGetAccessToken();

        // 设备序列号列表
        const serialNumbers = ['0001F3D5', '0001F3D6', '0001F3D4'];

        // 用于存储设备信息
        let devicesData = [];

        // 使用Promise.all并发查询多个设备信息
        const devicePromises = serialNumbers.map(async (serialNumber) => {
            const response = await axios.get('https://admin.zhilianweishi.com/api/device/getBySerialNumber', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    serialNumber: serialNumber,
                    type: 2  // 假设设备类型为传感器，若是网关请将值改为1
                }
            });
            devicesData.push(response.data);
        });

        await Promise.all(devicePromises);

        // 请求阈值数据
        const thresholdResponse = await axios.get('https://admin.zhilianweishi.com/api/threshold', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // 处理阈值数据
        const thresholdData = thresholdResponse.data.content;

        // 将阈值数据与设备信息结合
        devicesData = devicesData.map(device => {
            const threshold = thresholdData.find(th => th.serialNumber === device.serialNumber);
            if (threshold) {
                device.maxValue = threshold.maxValue;
                device.lowValue = threshold.lowValue;
                device.currentValue = threshold.currentValue;
            }
            return device;
        });

        res.json({success: true, data: devicesData});
    } catch (error) {
        res.status(500).json({success: false, message: '获取设备信息失败', error: error.message});
    }
});

// 获取烟雾数据的函数
async function getAlarmData() {
    const accessToken = await smokeGetAccessToken();

    // 获取当前时间作为endDate
    const endDate = new Date().toISOString().split('T')[0];

    // 获取当前时间往前一天作为startDate
    const startDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const response = await axios.get('https://admin.zhilianweishi.com/api/alarm', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        params: {
            pageSize: 20,
            pageNumber: 0,
            startDate: startDate,
            endDate: endDate
        }
    });

    let alarmData = response.data.content;

    // 处理警告值和内容
    return alarmData.map(alarm => {
        let alertValue;
        let content = alarm.content || '';

        if (content.includes('温度')) {
            alertValue = 100;
        } else if (content.includes('烟雾')) {
            alertValue = 120;
            // 处理烟雾报警内容
            content = '烟感报警';
            alarm.content = `${content}，${alarm.remark}`;
        }

        // 移除content中的温度信息
        alarm.content = alarm.content.replace(/，温度\d+(\.\d+)?°C/, '');

        // 使用原生 JavaScript 将 alarmDate 格式化为 "YYYY-MM-DD HH:mm:ss"
        alarm.alarmDate = formatDate(alarm.alarmDate);

        return {
            ...alarm,
            errorType: '烟雾',
            alertValue
        };
    });
}

// 获取故障数据的函数
async function getFaultData() {
    const responseData = await detectorGetAccessToken();
    const accessToken1 = responseData.access_token;

    // 获取当前时间的时间戳作为endDate
    const endDate = Date.now();

    // 获取当前时间往前一天的时间戳作为startDate
    const startDate = Date.now() - 86400000;

    // 查询 ALARM 数据
    const alarmResponse = await axios.get('https://fire-api.htcxcloud.com/api/v1/warning', {
        headers: {
            'Authorization': `Bearer ${accessToken1}`
        },
        params: {
            handleStatus: 'UNPROCESSED',
            type: 'ALARM', // 查询警报
            size: 10000,
            startTime: startDate,
            endTime: endDate
        }
    });

    const alarmData = alarmResponse.data.content.map(alarm => ({
        id: alarm.id,
        deviceName: alarm.deviceName,
        detailedAddress: alarm.detailedAddress,
        alarmDate: formatDate(alarm.warningTime),
        content: alarm.titles ? alarm.titles.join('') : '未知标题',
        alertValue: 70,
        errorType: '警报',
        deviceId: alarm.deviceName,
        modelName: alarm.model,
        address: alarm.detailedAddress,
        serialNumber: alarm.deviceName,
        siteName: alarm.deviceName,
        status: 0
    }));

    // 查询 FAULT 数据
    const faultResponse = await axios.get('https://fire-api.htcxcloud.com/api/v1/warning', {
        headers: {
            'Authorization': `Bearer ${accessToken1}`
        },
        params: {
            handleStatus: 'UNPROCESSED',
            type: 'FAULT', // 查询故障
            size: 10000,
            startTime: startDate,
            endTime: endDate
        }
    });

    const faultData = faultResponse.data.content.map(fault => ({
        id: fault.id,
        deviceName: fault.deviceName,
        detailedAddress: fault.detailedAddress,
        alarmDate: formatDate(fault.warningTime),
        content: fault.titles ? fault.titles.join('') : '未知标题',
        alertValue: 70,
        errorType: '故障',
        deviceId: fault.deviceName,
        modelName: fault.model,
        address: fault.detailedAddress,
        serialNumber: fault.deviceName,
        siteName: fault.deviceName,
        status: 0
    }));

    // 合并 ALARM 和 FAULT 数据
    return [...alarmData, ...faultData];
}


// 插入或更新数据库记录的函数
function upsertErrorRecord(errorType, date) {
    return new Promise((resolve, reject) => {
        // 查询是否存在相同 errorType 和 date 的记录
        const selectQuery = 'SELECT * FROM deviceError WHERE errorType = ? AND date = ?';
        db.query(selectQuery, [errorType, date], (err, results) => {
            if (err) {
                return reject(err);
            }

            if (results.length > 0) {
                // 如果存在记录，更新 count 和 updated_at
                const updateQuery = 'UPDATE deviceError SET count = count + 1, updated_at = NOW() WHERE id = ?';
                db.query(updateQuery, [results[0].id], (err, updateResult) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(updateResult);
                });
            } else {
                // 如果不存在记录，插入新记录
                const insertQuery = 'INSERT INTO deviceError (errorType, count, date, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())';
                db.query(insertQuery, [errorType, 1, date], (err, insertResult) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(insertResult);
                });
            }
        });
    });
}

// 主接口处理逻辑
app.get('/api/alarm', async (req, res) => {
    try {
        // 获取报警数据
        const alarmData = await getAlarmData();
        // 获取故障数据
        const faultData = await getFaultData();

        // 合并数据
        const combinedData = [...alarmData, ...faultData];

        // 获取当前日期
        const today = new Date().toISOString().split('T')[0];

        // 处理合并后的数据，将其写入数据库
        for (const data of combinedData) {
            await upsertErrorRecord(data.errorType, today);
        }

        res.json({ success: true, data: combinedData });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取报警信息失败', error: error.message });
    }
});

// 格式化日期的辅助函数
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}


app.get('/api/deviceParams', async (req, res) => {
    try {
        const responseData = await detectorGetAccessToken();
        const accessToken1 = responseData.access_token;
        // 请求设备参数的API URL
        const url = 'https://fire-api.htcxcloud.com/api/v1/device/66b75ebe9da0133cb703aba1/snap';

        // 发出GET请求
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken1}`,
                'Content-Type': 'application/json'
            }
        });

        // 发送响应回客户端
        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('获取设备参数失败:', error.message);
        res.status(500).json({
            success: false,
            message: '获取设备参数失败',
            error: error.message
        });
    }
});
app.get('/api/Temp', async (req, res) => {
    try {
        // 获取温度数据
        const responseData = await detectorGetAccessToken();
        const accessToken1 = responseData.access_token;

        const tempResponse = await axios.get(
            'https://fire-api.htcxcloud.com/api/v1/count/66b75ebe9da0133cb703aba1/aisleParamCurve?aisleUnit=TEMP',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken1}`
                }
            }
        );

        // 获取泄漏电流数据
        const leakageResponse = await axios.get(
            'https://fire-api.htcxcloud.com/api/v1/count/66b75ebe9da0133cb703aba1/aisleParamCurve?aisleUnit=LEAKAGE',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken1}`
                }
            }
        );
        const tempData = tempResponse.data;
        const leakageData = leakageResponse.data;

        const formattedData = {
            category: [],  // 用于存储时间戳对应的时间
            seriesData: {}  // 用于存储不同通道的温度和泄漏电流数据
        };

        // 处理温度数据
        tempData.forEach(channel => {
            const {aisleName, paramList} = channel;
            if (!formattedData.seriesData[aisleName]) {
                formattedData.seriesData[aisleName] = [];
            }

            paramList.forEach(param => {
                const time = new Date(param.countTime).toLocaleString(); // 转换时间戳为可读时间
                if (!formattedData.category.includes(time)) {
                    formattedData.category.push(time);
                }
                formattedData.seriesData[aisleName].push(parseFloat(param.val));
            });
        });

        // 处理泄漏电流数据
        leakageData.forEach(channel => {
            const {aisleName, paramList} = channel;
            if (!formattedData.seriesData[aisleName]) {
                formattedData.seriesData[aisleName] = [];
            }

            paramList.forEach(param => {
                const time = new Date(param.countTime).toLocaleString(); // 转换时间戳为可读时间
                if (!formattedData.category.includes(time)) {
                    formattedData.category.push(time);
                }
                formattedData.seriesData[aisleName].push(parseFloat(param.val));
            });
        });

        // 确保顺序为 CH1, CH2, CH3, CH4, CH5
        const orderedSeries = ['CH1', 'CH2', 'CH3', 'CH4', 'CH5'].reduce((result, key) => {
            if (formattedData.seriesData[key]) {
                result[key] = formattedData.seriesData[key];
            }
            return result;
        }, {});

        // 只保留最新的 10 个数据
        const latestData = {
            category: formattedData.category.slice(-10),
            seriesData: {}
        };

        for (let channel in orderedSeries) {
            latestData.seriesData[channel] = orderedSeries[channel].slice(-10);
        }

        res.json({
            success: true,
            data: latestData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});
