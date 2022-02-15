-- Model creation script
-- This script creates the relational model from scratch

-- Dynamic configuration

CREATE TABLE `dynamic_configuration` (
    `config_key` VARCHAR(255) PRIMARY KEY,
    `config_value` MEDIUMTEXT
);

