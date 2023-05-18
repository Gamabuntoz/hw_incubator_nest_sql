export class User {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public passwordHash: string,
    public createdAt: string,
    public emailConfirmationCode: string,
    public emailIsConfirmed: boolean,
    public emailConformExpirationDate: string,
    public passwordRecoveryCode: string | null,
    public passwordRecoveryExpirationDate: string | null,
    public userIsBanned: boolean,
    public userBanReason: string | null,
    public userBanDate: string | null,
  ) {}
}
