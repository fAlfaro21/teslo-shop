<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

### Resumen

TypeORM
Postgres
CRUD
Constrains
Validaciones
Búsquedas
Paginaciones
DTOs
Entities
Decoradores de TypeORM para entidades
Métodos BeforeInsert, BeforeUpdate

#### Trabajo con BBDD Relacional:
Relaciones
	De uno a muchos
	Muchos a uno
Query Runner
Query Builder
Transacciones
Commits y Rollbacks
Renombrar tablas
Creación de un SEED
Aplanar resultados

Los endpoint de creación y actualización de producto permiten la actualización de una tabla secundaria.

#### Carga de archivos a backend
validaciones y control de carga de archivos hacia el backend

#### Comunicación entre cliente y servidor mediante WebSockets:
Nest Gateways
Conexiones
Desconexiones
Emitir y escuchar mensajes desde el servidor y cliente
Cliente con Vite y TS
Autenticar conexión mediante JWTs
Usar mismo mecanismos de autenticación
Desconectar sockets manualmente
Prevenir doble conexión de usuarios autenticados.

# Teslo API

1. Clonar proyecto
2. ```yarn install```
3. Clonar el archivo ```.env.template``` y renombrar a ```.env```
4. Cambiar las variables de entorno
5. Levantar la BBDD
```
docker-compose up -d
```

6. Levantar: ```yarn start:dev```

7. Ejecutar Seed: 
```
http://localhost:3000/api/seed
```