// 引入依赖库
const express = require('express');
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// 初始化环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 应用中间件
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// 设置以太坊提供者
const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_PROVIDER);

// 读取合约信息（替换为您自己的合约地址和ABI）
const contractAddress = '0x...'; // 你的合约地址
const contractABI = [...]; // 你的合约ABI

// 创建合约实例
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// 定义一个获取合约数据的路由
app.get('/contract-data', async (req, res) => {
    try {
        // 假设你的合约有一个叫做getData的方法
        const data = await contract.getData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching contract data:', error);
        res.status(500).json({ success: false, message: 'Error fetching contract data' });
    }
});

// 定义一个接受用户输入并与合约互动的路由
app.post('/send-data', async (req, res) => {
    try {
        // 从请求体中获取数据
        const { userAddress, data } = req.body;
        // 设置一个带有用户私钥的钱包（在环境变量中定义）
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        // 连接钱包到合约
        const contractWithSigner = contract.connect(wallet);
        // 调用合约的一个方法，比如setData
        const tx = await contractWithSigner.setData(userAddress, data);
        await tx.wait(); // 等待交易被挖掘
        res.json({ success: true, message: 'Data successfully sent to the contract', txHash: tx.hash });
    } catch (error) {
        console.error('Error sending data to the contract:', error);
        res.status(500).json({ success: false, message: 'Error sending data to the contract' });
    }
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
