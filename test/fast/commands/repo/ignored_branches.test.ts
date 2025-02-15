import { expect } from 'chai';
import fs from 'fs-extra';
import { TrailingProdScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): repo ignored-branches`, function () {
    configureTest(this, scene);

    it('Can add to ignored-branches', () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      fs.removeSync(repoConfigPath);
      scene.repo.execCliCommand('repo init --trunk main');
      const branchToAdd = 'prod';
      scene.repo.execCliCommand(`repo ignored-branches --add ${branchToAdd}`);
      const savedConfig = JSON.parse(
        fs.readFileSync(repoConfigPath).toString()
      );
      expect(savedConfig['ignoreBranches']).to.contain(branchToAdd);
    });

    it('Can remove from ignored-branches', () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      fs.removeSync(repoConfigPath);
      scene.repo.execCliCommand('repo init --trunk main');
      const branch = 'prod';
      scene.repo.execCliCommand(`repo ignored-branches --add ${branch}`);
      let savedConfig = JSON.parse(fs.readFileSync(repoConfigPath).toString());
      expect(savedConfig['ignoreBranches']).to.contain(branch);
      scene.repo.execCliCommand(`repo ignored-branches --remove ${branch}`);
      savedConfig = JSON.parse(fs.readFileSync(repoConfigPath).toString());
      expect(savedConfig['ignoreBranches']).to.not.contain(branch);
    });

    it('Can get ignored-branches', () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      fs.removeSync(repoConfigPath);
      const branchToAdd = 'prod';
      scene.repo.execCliCommand(
        `repo init --trunk main --ignore-branches ${branchToAdd}`
      );
      expect(
        scene.repo.execCliCommandAndGetOutput(`repo ignored-branches`)
      ).to.contain(branchToAdd);
      const savedConfig = JSON.parse(
        fs.readFileSync(repoConfigPath).toString()
      );
      expect(savedConfig['ignoreBranches'][0]).to.eq(branchToAdd);
    });
  });
}
