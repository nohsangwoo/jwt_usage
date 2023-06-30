const userDatabase = require('../Database')
const jwt = require('jsonwebtoken')

const login = (req, res, next) => {
  const { email, password } = req.body

  const userInfo = userDatabase.filter(item => {
    return item.email === email
  })[0]

  console.log('userInfo: ', userInfo)
  if (!userInfo) {
    return res.status(403).json('NOT Authorized')
  } else {
    try {
      // access token 발급
      const accessToken = jwt.sign(
        {
          ...userInfo,
        },
        process.env.ACCESS_SECRET,
        {
          // 토큰 유효기간
          // access token은 짧은유효기간을 가져야 한다.
          expiresIn: '1m',
          issuer: 'milli tech',
        },
      )
      console.log('accessToken: ', accessToken)

      const refreshToken = jwt.sign(
        {
          ...userInfo,
        },
        process.env.REFRESH_SECRET,
        {
          // refresh token은 access token을 갱신하기위한 토큰이므로 유효기간이 길어야함
          expiresIn: '24h',
        },
      )

      // 생성된 accessToken과 refreshToken을 client에게 전송한다(이때 우리의 db에도 저장하여 추후 요청시 로그인 유지를 관리한다)
      res.cookie('accessToken', accessToken, {
        // http: false, https:true
        secure: false,
        // javascript단에서 접근이 불가능하고 브라우저 상에서만 접근 가능하도록 설정.
        httpOnly: true,
      })

      res.cookie('refreshToken', refreshToken, {
        // http: false, https:true
        secure: false,
        // javascript단에서 접근이 불가능하고 브라우저 상에서만 접근 가능하도록 설정.
        httpOnly: true,
      })

      return res.status(200).json('login success')
      // refresh token 발급
    } catch (error) {
      return res.status(500).json(error)
    }
  }
}

const accessToken = (req, res) => {}

const refreshToken = (req, res) => {}

const loginSuccess = (req, res) => {}

const logout = (req, res) => {}

module.exports = { login, accessToken, refreshToken, loginSuccess, logout }
