create table WheeTEC.admins
(
    id       bigint unsigned auto_increment
        primary key,
    login    varchar(255) null,
    password varchar(255) not null
);

create table WheeTEC.faq
(
    id          bigint unsigned auto_increment
        primary key,
    title       varchar(255) not null,
    description text         not null
);

create table WheeTEC.products
(
    id          bigint unsigned auto_increment
        primary key,
    name        varchar(255) not null,
    price       int          not null,
    description longtext     not null,
    image       varchar(255) not null,
    type        varchar(255) not null
);

create table WheeTEC.support
(
    id      bigint unsigned auto_increment
        primary key,
    email   varchar(255) not null,
    name    varchar(255) not null,
    message varchar(255) not null
);

create table WheeTEC.users
(
    id       bigint unsigned auto_increment
        primary key,
    login    varchar(255) not null,
    password varchar(255) not null
);

create table WheeTEC.cart
(
    id      bigint unsigned auto_increment
        primary key,
    user    bigint unsigned not null,
    product bigint unsigned not null,
    constraint cart_products_id_fk
        foreign key (product) references WheeTEC.products (id)
            on delete cascade,
    constraint cart_users_id_fk
        foreign key (user) references WheeTEC.users (id)
            on delete cascade
);

create table WheeTEC.orders
(
    id       bigint unsigned auto_increment
        primary key,
    user     bigint unsigned not null,
    product  bigint unsigned not null,
    order_id char(36)        not null,
    constraint orders_products_id_fk
        foreign key (product) references WheeTEC.products (id)
            on delete cascade,
    constraint orders_users_id_fk
        foreign key (user) references WheeTEC.users (id)
            on delete cascade
);

