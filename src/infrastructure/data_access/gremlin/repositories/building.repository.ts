import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Building } from 'src/domain/buildings/building/building';
import { BuildingMapper } from '../../mappers/building.mapper';
import { GremlinService } from '../gremlin.service';

@Injectable()
export class BuildingRepository {
  constructor(
    private gremlinService: GremlinService,
    private buildingMapper: BuildingMapper,
  ) {}

  async createBuilding(building: Building) {
    const found = await this.gremlinService._client.submit(
      "g.V('id', id).hasLabel('Building')",
      {
        id: building.name,
      },
    );
    if (found._items.length > 0) {
      throw new ConflictException('Building aklready exists');
    }
    const buildingCreated = await this.gremlinService._client.submit(
      "g.addV(label).property('id', id).property('name', name).property('address', address).property('buildingId', buildingId).property('pk', 'pk')",
      {
        label: 'Building',
        id: `${building.name}`,
        name: building.name,
        address: building.address,
        buildingId: building.id,
      },
    );
    return this.buildingMapper.toDomain(buildingCreated)[0];
  }

  async getBuilding(id: string) {
    const building = await this.gremlinService._client.submit(
      "g.V('id', id).hasLabel('Building')",
      {
        id,
      },
    );
    if (!building._items.length) {
      throw new NotFoundException('id not found');
    }
    return this.buildingMapper.toDomain(building)[0];
  }

  async getAllBuildings() {
    const buildings = await this.gremlinService._client.submit(
      "g.V().hasLabel('Building')",
    );
    const result = { _items: this.buildingMapper.toDomain(buildings) };
    return result;
  }

  async deleteBuilding(id: string) {
    await this.getBuilding(id);
    await this.gremlinService._client.submit(
      "g.V('id', id).hasLabel('Building').drop()",
      {
        id,
      },
    );
    return 'Deleted';
  }
}