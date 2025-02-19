import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AngularCropperjsModule, CropperComponent } from 'angular-cropperjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PresetService } from '../../services/preset/preset.service';
import { ToastService } from '../../services/toast/toast.service';
import { CommonModule } from '@angular/common';


@Component({
	selector: 'app-create-preset',
	standalone: true,
	imports: [RouterModule, AngularCropperjsModule, ReactiveFormsModule, CommonModule],
	templateUrl: './create-preset.component.html',
	styleUrls: ['./create-preset.component.css']
})
export class CreatePresetComponent implements OnInit {
	isEditMode = false;
	presetId: string | null = null;
	preset:any|null = null;

	x1: Number = 0;
	x2: Number = 0;
	y1: Number = 0;
	y2: Number = 0;

	@ViewChild('imageFile') image!: ElementRef<HTMLInputElement>;
	@ViewChild('cropper') public angularCropper!: CropperComponent;

	uploadedImageUrl: string | null = null;
	file: File | null = null;
	presetForm: FormGroup;

	config = {
		aspectRatio: 0,
		viewMode: 1,
		autoCropArea: 0.8,
		cropBoxResizable: true,
		cropBoxMovable: true,
		background: true,
		crop: (event: any) => {
			this.updateCoordinates(event);
		}
	};


	constructor(private formBuilder: FormBuilder, private presetService: PresetService, private route: ActivatedRoute, private toastService:ToastService, private router:Router) {
		this.presetForm = this.formBuilder.group({
			x1: [0, Validators.required],
			x2: [0, Validators.required],
			y1: [0, Validators.required],
			y2: [0, Validators.required],
			website_url: ['', Validators.required]
		});
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.presetId = params.get('id');
			this.isEditMode = !!this.presetId;

			if (this.isEditMode) {
				this.loadPreset(this.presetId);
			}
		});
	}

	loadPreset(id:string|null) {
		if(id) {
			this.presetService.getPreset(id).subscribe({
				next: (data) => {
					this.preset = data;
					this.x1 = this.preset.x1;
					this.x2 = this.preset.x2;
					this.y1 = this.preset.y1;
					this.y2 = this.preset.y2;

					this.presetForm.get('x1')?.setValue(this.x1);
					this.presetForm.get('x2')?.setValue(this.x2);
					this.presetForm.get('y1')?.setValue(this.y1);
					this.presetForm.get('y2')?.setValue(this.y2);
					this.presetForm.get('website_url')?.setValue(this.preset.website_url);
					this.uploadedImageUrl = this.presetService.getPresetImageURL(this.preset);

					
					console.log(this.uploadedImageUrl);
					console.log(data);
				},
				error: () => {
					alert('Failed to load saved preset.');
				}
			})
		}
		else {
			alert('Failed to load saved preset.');
		}
	}

	onCropperReady() {
		if(this.isEditMode) {
			this.angularCropper.cropper.setData({
				x:this.preset.x1,
				y:this.preset.y1,
				width:this.preset.x2 - this.preset.x1,
				height:this.preset.y2 - this.preset.y1,
				scaleX:1,
				scaleY:1
			});
		}
	}

	updateCoordinates(event: any) {
		const cropData = event.detail;
		this.x1 = Math.ceil(cropData.x);
		this.y1 = Math.ceil(cropData.y);
		this.x2 = Math.ceil(cropData.x + cropData.width);
		this.y2 = Math.ceil(cropData.y + cropData.height);

		this.presetForm.get('x1')?.setValue(this.x1);
		this.presetForm.get('x2')?.setValue(this.x2);
		this.presetForm.get('y1')?.setValue(this.y1);
		this.presetForm.get('y2')?.setValue(this.y2);
	}

	onBrowseImage() {
		this.image.nativeElement.click();
	}

	onImageUploaded(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.file = input.files[0];
			this.uploadedImageUrl = URL.createObjectURL(this.file);
		}
	}

	onPresetSubmit() {
		if (this.isEditMode) 
		{
			if(this.presetForm.valid){
				const formData = new FormData();
				formData.append('x1', this.presetForm.value.x1);
				formData.append('x2', this.presetForm.value.x2);
				formData.append('y1', this.presetForm.value.y1);
				formData.append('y2', this.presetForm.value.y2);
				formData.append('website_url', this.presetForm.value.website_url);
				formData.append('date', this.presetForm.value.date || '');

					this.presetService.updatePreset(this.presetId,formData).subscribe({
					next:()=>{
						this.toastService.showToast({
							message: 'Preset updated successfully',
							type: 'success',
						});
						this.router.navigate(['/scan-region-presets']);
					},
					error: (error) => {
						console.error('Error:', error);
						this.toastService.showToast({
							message: 'Error! Failed to update the preset',
							type: 'error',
						});
					}
				})
			}
			else {
				alert('Please fill all required fields');
			}
		} 
		else
		{
			if(this.presetForm.valid && this.file){
				const formData = new FormData();
				formData.append('image', this.file);
				formData.append('x1', this.presetForm.value.x1);
				formData.append('x2', this.presetForm.value.x2);
				formData.append('y1', this.presetForm.value.y1);
				formData.append('y2', this.presetForm.value.y2);
				formData.append('website_url', this.presetForm.value.website_url);
				formData.append('date', this.presetForm.value.date || '');

				this.presetService.savePreset(formData).subscribe({
					next: (response) => {
						console.log('Preset saved:', response);
						this.toastService.showToast({
							message: 'Preset saved successfully',
							type: 'success',
						});
						this.router.navigate(['/scan-region-presets']);
					},
					error: (error) => {
						console.error('Error:', error);
						this.toastService.showToast({
							message: 'Error! Failed to save the preset',
							type: 'error',
						});
					}
				});
			}
			else {
				alert('Please fill all required fields');
			}
		}
	}
}
