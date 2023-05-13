export class AuthDeviceDTO {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
  ) {}
}

export class RefreshPayloadDTO {
  constructor(
    public userId: string,
    public deviceId: string,
    public issueAt: number,
  ) {}
}
