import { Component, inject, signal } from '@angular/core';
import { ProductTableComponent } from '../../../products/components/product-table/product-table.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductsService } from '@products/services/products.service';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTableComponent, PaginationComponent, RouterLink],
  templateUrl: './products-admin-page.component.html',
})
export class ProductsAdminPageComponent {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  productsPerPage = signal(10);

  productsResource = rxResource({
    request: () => ({
      page: this.paginationService.currentPage() - 1,
      limit: this.productsPerPage(),
    }),
    loader: ({ request }) => {
      return this.productsService.getProducts({
        offset: request.page * this.productsPerPage(),
        limit: request.limit,
      });
    },
  });
}
