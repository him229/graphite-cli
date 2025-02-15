import { execSync } from 'child_process';
import fs from 'fs-extra';
import { rebaseInProgress, unstagedChanges } from './';

const TEXT_FILE_NAME = 'test.txt';
export default class GitRepo {
  dir: string;
  constructor(
    dir: string,
    opts?: { existingRepo?: boolean; repoUrl?: string }
  ) {
    this.dir = dir;
    if (opts?.existingRepo) {
      return;
    }
    if (opts?.repoUrl) {
      execSync(`git clone ${opts.repoUrl} ${dir}`);
    } else {
      execSync(`git init ${dir} -b main`);
    }
  }

  execCliCommand(command: string): void {
    execSync(
      `NODE_ENV=development node ${__dirname}/../../../../dist/src/index.js ${command}`,
      {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
        cwd: this.dir,
      }
    );
  }

  execCliCommandAndGetOutput(command: string): string {
    return execSync(
      `NODE_ENV=development node ${__dirname}/../../../../dist/src/index.js ${command}`,
      {
        cwd: this.dir,
      }
    )
      .toString()
      .trim();
  }

  unstagedChanges(): boolean {
    return unstagedChanges();
  }

  createChange(textValue: string, prefix?: string, unstaged?: boolean): void {
    const filePath = `${this.dir}/${
      prefix ? prefix + '_' : ''
    }${TEXT_FILE_NAME}`;
    fs.writeFileSync(filePath, textValue);
    if (!unstaged) {
      execSync(`git -C "${this.dir}" add ${filePath}`);
    }
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    execSync(`git -C "${this.dir}" add .`);
    execSync(`git -C "${this.dir}" commit -m "${textValue}"`);
  }

  createChangeAndAmend(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    execSync(`git -C "${this.dir}" add .`);
    execSync(`git -C "${this.dir}" commit --amend --no-edit`);
  }

  deleteBranch(name: string): void {
    execSync(`git -C "${this.dir}" branch -D ${name}`);
  }

  createPrecommitHook(contents: string): void {
    fs.mkdirpSync(`${this.dir}/.git/hooks`);
    fs.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
    execSync(`chmod +x ${this.dir}/.git/hooks/pre-commit`);
  }

  createAndCheckoutBranch(name: string): void {
    execSync(`git -C "${this.dir}" checkout -b "${name}"`, { stdio: 'ignore' });
  }

  checkoutBranch(name: string): void {
    execSync(`git -C "${this.dir}" checkout "${name}"`, { stdio: 'ignore' });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ dir: this.dir });
  }

  resolveMergeConflicts(): void {
    execSync(`git -C "${this.dir}" checkout --theirs .`);
  }

  markMergeConflictsAsResolved(): void {
    execSync(`git -C "${this.dir}" add .`, { stdio: 'ignore' });
  }

  finishInteractiveRebase(opts?: { resolveMergeConflicts?: boolean }): void {
    while (this.rebaseInProgress()) {
      if (opts?.resolveMergeConflicts) {
        this.resolveMergeConflicts();
      }
      this.markMergeConflictsAsResolved();
      execSync(`GIT_EDITOR="touch $1" git -C ${this.dir} rebase --continue`, {
        stdio: 'ignore',
      });
    }
  }

  currentBranchName(): string {
    return execSync(`git -C "${this.dir}" branch --show-current`)
      .toString()
      .trim();
  }

  listCurrentBranchCommitMessages(): string[] {
    return execSync(`git -C "${this.dir}" log --oneline  --format=%B`)
      .toString()
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);
  }

  mergeBranch(args: { branch: string; mergeIn: string }): void {
    execSync(
      `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
      {
        stdio: 'ignore',
      }
    );
  }
}
