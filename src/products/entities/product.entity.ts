import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product_image.entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
//Esta entidad es la respresentación de este objeto en la BBDD, es una tabla
//Es lo que va a buscar TypeORM para crearse la referencia en la  base de datos
//Por ello es necesario un decorador @Entity()

//De esta manera podemos definir nuestra estructura en lugar de hacerlo en la BBD, es mucho más sencillo

@Entity({ name: 'products' })//estoy renombrando la tabla
export class Product {

    @ApiProperty({
        example: 'ed859e4e-fb41-4c97-bc69-3b1193a48198',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Tshirt Teslo',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: '15',
        description: 'Product Price',
        uniqueItems: true
    })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'Nisi occaecat ut ad ullamco laboris sunt do cupidatat occaecat ad elit veniam Lorem tempor.',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt-teslo',
        description: 'Product slug - for SEO',
        uniqueItems: true
    })
    @Column( 'text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: '10',
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: [ 'S','M','L'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'Women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        //¿cómo se va a relacionar?:
        //1. Citamos la entidad con la que se relaciona, la tabla a la que quiero apuntar
        () => ProductImage,
        //2. ¿Cómo se relaciona mi instancia de producto con esta tabla?
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];


    @ManyToOne(
        () => User,
         //2. ¿Cómo se relaciona mi instancia de producto con esta tabla?. Ponemos el atributo o propiedad "product" que debería estar en la entidad "User"
        (user) => user.product,
        //Esto hará que cada vez que se haga una consulta de proeuctos, cargue automáticamente la relación
        { eager: true }
    )
    user: User


    @BeforeInsert()
    checkSlugInsert(){

        if ( !this.slug ){
        this.slug = this.title
        } 
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
      
    }


    
    @BeforeUpdate()
    checkSlugUpdate(){

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
      
    }

}
