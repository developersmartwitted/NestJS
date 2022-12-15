import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Panoton API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .setDescription(
      `Panoton apis. 
       Base url: https://api.panoton.com`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
