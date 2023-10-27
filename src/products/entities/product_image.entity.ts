import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: 'product_images' })//estoy renombrando la tabla
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        //Si elimina el producto, se eliminan todas las imágenes relacionadas
        { onDelete: 'CASCADE' }
    )
    product: Product

}