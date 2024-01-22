DROP TABLE IF EXISTS driver_location;
DROP TABLE IF EXISTS poi_constants;
DROP TABLE IF EXISTS driver_distance;

CREATE TABLE IF NOT EXISTS poi_constants(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    latitude DOUBLE(15,8) NOT NULL,
    longitude DOUBLE(15,8) NOT NULL,
    zone varchar(255),
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY(id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


CREATE TABLE IF NOT EXISTS driver_distance(
    id int NOT NULL AUTO_INCREMENT,
    driverID int UNSIGNED NOT NULL,
    poiID int NOT NULL,
    distance DOUBLE(15,8) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT rydo_db_v2_driver_distance1
    FOREIGN KEY (poiID) 
    REFERENCES poi_constants(id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT rydo_db_v2_driver_distance2
    FOREIGN KEY (driverID) 
    REFERENCES providers(id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
     PRIMARY KEY(id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


ALTER TABLE providers
ADD availability_status ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
ADD connection_status ENUM('ForHire', 'Hired') NOT NULL DEFAULT 'ForHire',
ADD location_timestamp TIMESTAMP NULL DEFAULT NULL;
