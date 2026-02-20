import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAddresses1771529504315 implements MigrationInterface {
  name = 'InitialAddresses1771529504315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO addresses (user_id, street, number, complement, neighborhood, city, state, zip_code, country, is_default)
            VALUES
                (1, 'Rua das Flores', '123', 'Apto 45', 'Centro', 'São Paulo', 'SP', '01310-100', 'Brasil', true)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM addresses WHERE user_id = 1
        `);
  }
} 
