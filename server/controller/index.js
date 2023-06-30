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
      const { password, ...others } = userInfo
      const accessToken = jwt.sign(
        {
          ...others,
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
          ...others,
        },
        process.env.REFRESH_SECRET,
        {
          // refresh token은 access token을 갱신하기위한 토큰이므로 유효기간이 길어야함
          expiresIn: '24h',
          issuer: 'milli tech',
        },
      )

      console.log('refreshToken: ', refreshToken)

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

// accessToken을 이용하여 사용자 정보를 반환하는 역할.
const accessToken = (req, res) => {
  try {
    const accessToken = req.cookies.accessToken
    console.log('브라우저로부터 전달받은 accessToken: ', accessToken)

    const data = jwt.verify(accessToken, process.env.ACCESS_SECRET)

    console.log('브라우저로부터 전달받은 data: ', data)
    const userData = userDatabase.filter(item => {
      return item.email === data.email
    })[0]

    console.log('userData: ', userData)
    const { password, ...others } = userData
    return res.status(200).json(others)
  } catch (error) {
    console.log('error msg: ', error)
    return res.status(500).json(error)
  }
}

// refresh token을 가지고 access token을 갱신하는 용도.
const refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    console.log('refreshToken: ', refreshToken)
    const data = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    const userInfo = userDatabase.filter(item => item.email === data.email)[0]
    console.log('userInfo: ', userInfo)

    // acccess token 새로발급
    const { password, ...others } = userInfo
    const accessToken = jwt.sign(
      {
        ...others,
      },
      process.env.ACCESS_SECRET,
      {
        // 토큰 유효기간
        // access token은 짧은유효기간을 가져야 한다.
        expiresIn: '1m',
        issuer: 'milli tech',
      },
    )

    // access token 브라우저로 전달.
    res.cookie('accessToken', accessToken, {
      // http: false, https:true
      secure: false,
      // javascript단에서 접근이 불가능하고 브라우저 상에서만 접근 가능하도록 설정.
      httpOnly: true,
    })

    return res.status(200).json('access token recreated')
  } catch (error) {}
}

const loginSuccess = (req, res) => {
  try {
    const accessToken = req.cookies.accessToken
    const data = jwt.verify(accessToken, process.env.ACCESS_SECRET)
    const userInfo = userDatabase.filter(item => item.email === data.email)[0]
    console.log('login success userInfo: ', userInfo)
    return res.status(200).json(userInfo)
  } catch (error) {
    res.status(500).json(error)
  }
}

const logout = (req, res) => {
  try {
    res.cookie('accessToken', '')
    res.status(200).json('Logout success!')
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = { login, accessToken, refreshToken, loginSuccess, logout }
