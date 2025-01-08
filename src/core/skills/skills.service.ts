import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { SkillType } from './skills.constants';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findOrCreateSkill(
    skillDto: CreateSkillDto,
    profile: Profile,
    type: SkillType,
  ) {
    let skill = await this.skillsRepository.findOne({
      where: { title: skillDto.title.toLowerCase() },
      relations: ['profiles'],
    });

    if (!skill) {
      skill = this.skillsRepository.create({
        title: skillDto.title.toLowerCase(),
        type,
        profiles: [profile],
      });

      skill = await this.skillsRepository.save(skill);
    } else {
      if (!skill.profiles.some((p) => p.id === profile.id)) {
        skill.profiles.push(profile);

        await this.skillsRepository.save(skill);
      }
    }

    return skill;
  }

  async listAllSkills() {
    return await this.skillsRepository.find();
  }
}
