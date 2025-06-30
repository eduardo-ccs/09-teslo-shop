import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormUtils } from '@utils/form-utils';
import { Product } from '@products/interfaces/product.interface';
import { ProductCarouselComponent } from '../../../../products/components/product-carousel/product-carousel.component';
import { FormErrorLabelComponent } from '../../../../shared/components/form-error-label/form-error-label.component';
import { ProductsService } from '@products/services/products.service';

@Component({
  selector: 'product-details',
  imports: [
    ProductCarouselComponent,
    ReactiveFormsModule,
    FormErrorLabelComponent,
  ],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();

  router = inject(Router);
  fb = inject(FormBuilder);

  productService = inject(ProductsService);

  wasSaved = signal<boolean>(false);
  tempImages = signal<string[]>([]);
  imageFileList: FileList | undefined = undefined;

  imagesToCarrousel = computed(() => {
    const currentProductImages = [
      ...this.product().images,
      ...this.tempImages(),
    ];

    return currentProductImages;
  });

  messageSaved: string = '';

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [<string[]>[]],
    images: [[]],
    tags: '',
    gender: [
      'men',
      [Validators.required, Validators.pattern(/men|women|kid|unisex/)],
    ],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
    // this.productForm.patchValue(formLike nas any);
  }

  // onSizeCliked(size: string) {
  //   const currentSizes = this.productForm.value.sizes ?? [];

  //   if (currentSizes?.includes(size)) {
  //     currentSizes.splice(currentSizes.indexOf(size), 1);
  //   } else currentSizes.push(size);

  //   this.productForm.patchValue({ sizes: currentSizes });
  // }

  onSizeCliked(size: string) {
    // Asegura que siempre sea un array y haz una copia para no mutar el original
    const currentSizes: string[] = Array.isArray(this.productForm.value.sizes)
      ? [...this.productForm.value.sizes]
      : [];

    const index = currentSizes.indexOf(size);
    if (index > -1) {
      currentSizes.splice(index, 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid) return;

    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags:
        formValue.tags
          ?.toLowerCase()
          .split(',')
          .map((tag) => tag.trim()) ?? [],
    };

    let idNewProduct = '';
    if (this.product().id === 'new') {
      // Crear producto
      const product = await firstValueFrom(
        this.productService.createProduct(productLike, this.imageFileList)
      );
      idNewProduct = product.id;

      this.messageSaved = 'Producto creado correctamente';
    } else {
      // Actualizar producto
      await firstValueFrom(
        this.productService.updateProduct(
          this.product().id,
          productLike,
          this.imageFileList
        )
      );
      this.messageSaved = 'Producto actualizado correctamente';
    }

    this.wasSaved.set(true);

    setTimeout(() => {
      this.wasSaved.set(false);
      if (this.product().id === 'new') {
        this.router.navigate(['/admin/products', idNewProduct]);
      }
    }, 2000);
  }
  //Manejo de imagenes
  onFilesChanged(event: Event) {
    const filesList = (event.target as HTMLInputElement).files;
    this.imageFileList = filesList ?? undefined;

    const imagesUrls = Array.from(filesList ?? []).map((file) =>
      URL.createObjectURL(file)
    );
    this.tempImages.set(imagesUrls);
  }
}
// if (this.product().id === 'new') {
//   // Crear producto

//   this.productService.createProduct(productLike).subscribe((product) => {
//     console.log('producto creado');
//     this.router.navigate(['/admin/products', product.id]);
//     this.messageSaved = 'Producto creado correctamente';
//   });
// } else {
//   // Actualizar producto
//   this.productService
//     .updateProduct(this.product().id, productLike)
//     .subscribe((product) => {
//       console.log('producto actualizado');
//       this.messageSaved = 'Producto actualizado correctamente';
//     });
// }
// this.wasSaved.set(true);
