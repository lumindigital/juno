export class RecursiveTemplate {
    readonly isRecursive: boolean;
    readonly templateName: string;

    constructor(templateName: string) {
        this.isRecursive = true;
        this.templateName = templateName;
    }
}
