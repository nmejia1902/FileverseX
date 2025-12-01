-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ServicioMilitar
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `ServicioMilitar` ;

-- -----------------------------------------------------
-- Schema ServicioMilitar
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ServicioMilitar` DEFAULT CHARACTER SET utf8 ;
USE `ServicioMilitar` ;

-- -----------------------------------------------------
-- Table `ServicioMilitar`.`Soldado`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ServicioMilitar`.`Soldado` ;

CREATE TABLE IF NOT EXISTS `ServicioMilitar`.`Soldado` (
  `idSoldado` INT NOT NULL,
  `Nombre` VARCHAR(45) NULL,
  `Apellidos` VARCHAR(45) NULL,
  `Graduacion` VARCHAR(45) NULL,
  `Cuerpo` VARCHAR(45) NULL,
  `Compañia` VARCHAR(45) NULL,
  `Cuartel` VARCHAR(45) NULL,
  PRIMARY KEY (`idSoldado`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ServicioMilitar`.`Cuerpo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ServicioMilitar`.`Cuerpo` ;

CREATE TABLE IF NOT EXISTS `ServicioMilitar`.`Cuerpo` (
  `Codigo` INT NOT NULL,
  `Denominacion` VARCHAR(45) NULL,
  `Soldado_idSoldado` INT NOT NULL,
  PRIMARY KEY (`Codigo`),
  INDEX `fk_Cuerpo_Soldado_idx` (`Soldado_idSoldado` ASC) VISIBLE,
  CONSTRAINT `fk_Cuerpo_Soldado`
    FOREIGN KEY (`Soldado_idSoldado`)
    REFERENCES `ServicioMilitar`.`Soldado` (`idSoldado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ServicioMilitar`.`Servicio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ServicioMilitar`.`Servicio` ;

CREATE TABLE IF NOT EXISTS `ServicioMilitar`.`Servicio` (
  `Codigo` INT NOT NULL,
  `Descripcion` VARCHAR(45) NULL,
  `Soldado_idSoldado` INT NOT NULL,
  PRIMARY KEY (`Codigo`),
  INDEX `fk_Servicio_Soldado1_idx` (`Soldado_idSoldado` ASC) VISIBLE,
  CONSTRAINT `fk_Servicio_Soldado1`
    FOREIGN KEY (`Soldado_idSoldado`)
    REFERENCES `ServicioMilitar`.`Soldado` (`idSoldado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ServicioMilitar`.`Cuartel`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ServicioMilitar`.`Cuartel` ;

CREATE TABLE IF NOT EXISTS `ServicioMilitar`.`Cuartel` (
  `Codigo` INT NOT NULL,
  `Nombre` VARCHAR(45) NULL,
  `Ubicacion` VARCHAR(45) NULL,
  `Soldado_idSoldado` INT NOT NULL,
  PRIMARY KEY (`Codigo`),
  INDEX `fk_Cuartel_Soldado1_idx` (`Soldado_idSoldado` ASC) VISIBLE,
  CONSTRAINT `fk_Cuartel_Soldado1`
    FOREIGN KEY (`Soldado_idSoldado`)
    REFERENCES `ServicioMilitar`.`Soldado` (`idSoldado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ServicioMilitar`.`Compañia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ServicioMilitar`.`Compañia` ;

CREATE TABLE IF NOT EXISTS `ServicioMilitar`.`Compañia` (
  `Numero` INT NOT NULL,
  `Compañia` VARCHAR(45) NULL,
  `Cuartel_Codigo` INT NOT NULL,
  `Soldado_idSoldado` INT NOT NULL,
  PRIMARY KEY (`Numero`),
  INDEX `fk_Compañia_Cuartel1_idx` (`Cuartel_Codigo` ASC) VISIBLE,
  INDEX `fk_Compañia_Soldado1_idx` (`Soldado_idSoldado` ASC) VISIBLE,
  CONSTRAINT `fk_Compañia_Cuartel1`
    FOREIGN KEY (`Cuartel_Codigo`)
    REFERENCES `ServicioMilitar`.`Cuartel` (`Codigo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Compañia_Soldado1`
    FOREIGN KEY (`Soldado_idSoldado`)
    REFERENCES `ServicioMilitar`.`Soldado` (`idSoldado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;






use serviciomilitar;
insert into soldado(idSoldado,Nombre,Apellidos,Graduacion,Cuerpo,Compañia,Cuartel)
values(1,"Nestor","Mejia","primera","marines","quinta","FcoMorazan");

select * from soldado;

insert into soldado(idSoldado,Nombre,Apellidos,Graduacion,Cuerpo,Compañia,Cuartel)
values(2,"Pedro","Mejia","primera","marines","quinta","FcoMorazan");

insert into soldado(idSoldado,Nombre,Apellidos,Graduacion,Cuerpo,Compañia,Cuartel)
values(4,"Sofia","cabrera","Segunda","Paracaidas","primera","FcoMorazan");


select * from soldado;


update soldado
set nombre = "Juan"
where idSoldado = 2;



delete from soldado
where idSoldado = 3;


select * from soldado;

