import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsers1771529504314 implements MigrationInterface {
  name = 'InitialUsers1771529504314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO users (id, name, email, password)
            VALUES
                (1, 'Nícolas Nunes', 'nicolasanunes@email.com', '$2a$12$Yi6vPRoytJS7vyj/DtRyj.dDDbwd8fh6dqvpoKhZ/NItVpkGXvJ9q')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM users WHERE id IN (1, 2, 3, 4)
        `);
  }
}
