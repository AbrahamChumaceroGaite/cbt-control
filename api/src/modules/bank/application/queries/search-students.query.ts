export class SearchStudentsQuery {
  constructor(
    public readonly q: string,
    public readonly excludeId: string,
    public readonly courseId?: string,
  ) {}
}
