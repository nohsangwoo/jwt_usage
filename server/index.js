const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const {
  login,
  accessToken,
  refreshToken,
  loginSuccess,
  logout,
} = require('./controller')

const app = express()
dotenv.config()

// 기본설정
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: 'http:locahost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  }),
)

// # api...

// 로그인
app.post('/login', login)

// access token 발급
app.get('/accesstoken', accessToken)

// access token 갱신
app.get('/refreshtoken', refreshToken)

// 로그인 성공시 사용자가 요청하면
// 현재 브라우저 쿠키에 저장된 access token을 전달받는다
// 전달받은 쿠키안의 access token에서 사용자정보를 파싱하고 client에게 전달해준다.
app.get('/login/success', loginSuccess)

// 로그아웃
// 쿠키안에 저장되어있는 access token을 제거하는 역할.
app.get('/login/success', logout)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server is on ${PORT}`)
})
