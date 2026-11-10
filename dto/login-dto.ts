// Request body for POST /login/student
export class LoginDto {
  username: string
  password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }

  // credentials are read from env: .env locally, GitHub secrets in CI
  static createLoginWithCorrectData(): LoginDto {
    return new LoginDto(process.env['DL_USERNAME']!, process.env['DL_PASSWORD']!)
  }

  static createLoginWithIncorrectPassword(): LoginDto {
    return new LoginDto(process.env['DL_USERNAME']!, 'wrong-password-' + Date.now())
  }

  static createLoginWithIncorrectUsername(): LoginDto {
    return new LoginDto('unknown-user-' + Date.now(), process.env['DL_PASSWORD']!)
  }
}
