DELIMITER $$

CREATE PROCEDURE CreateImageForPlant (plantID BIGINT, imageDesc VARCHAR(1000))
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;  -- rollback any changes made in the transaction
        RESIGNAL;  -- raise again the sql exception to the caller
    END;

    INSERT INTO images (uploaded, description) VALUES (NOW(), imageDesc);

    SET @imageID = LAST_INSERT_ID();

    INSERT INTO plant_images (plant_id, image_id) VALUES (plantID, @imageID);
    
    SELECT @imageID;
    
END$$

DELIMITER ;