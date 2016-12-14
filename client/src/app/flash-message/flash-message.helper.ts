export class FlashMessageHelper {
	constructor(private flashMessageService: any){}

	expect(message: string, className: string){
		expect(this.flashMessageService.showMessage).toHaveBeenCalledWith({
			message: message,
			messageClass: className
		});
	}
	expectSuccess(message: string){
		this.expect(message, 'success');
	}
	expectFailure(message: string){
		this.expect(message, 'danger');
	}
}
