import { Command, CommandRunner, Option } from 'nest-commander';
import chalk from 'chalk';

import { WorkspaceHealthMode } from 'src/workspace/workspace-health/interfaces/workspace-health-options.interface';
import { WorkspaceHealthFixKind } from 'src/workspace/workspace-health/interfaces/workspace-health-fix-kind.interface';

import { WorkspaceHealthService } from 'src/workspace/workspace-health/workspace-health.service';

interface WorkspaceHealthCommandOptions {
  workspaceId: string;
  verbose?: boolean;
  mode?: WorkspaceHealthMode;
  fix?: WorkspaceHealthFixKind;
}

@Command({
  name: 'workspace:health',
  description: 'Check health of the given workspace.',
})
export class WorkspaceHealthCommand extends CommandRunner {
  constructor(private readonly workspaceHealthService: WorkspaceHealthService) {
    super();
  }

  async run(
    _passedParam: string[],
    options: WorkspaceHealthCommandOptions,
  ): Promise<void> {
    const issues = await this.workspaceHealthService.healthCheck(
      options.workspaceId,
      {
        mode: options.mode ?? WorkspaceHealthMode.All,
      },
    );

    if (issues.length === 0) {
      console.log(chalk.green('Workspace is healthy'));
    } else {
      console.log(chalk.red('Workspace is not healthy'));

      if (options.verbose) {
        console.group(chalk.red('Issues'));
        issues.forEach((issue) => {
          console.log(chalk.yellow(JSON.stringify(issue, null, 2)));
        });
        console.groupEnd();
      }
    }

    if (options.fix) {
      await this.workspaceHealthService.fixIssues(
        options.workspaceId,
        issues,
        options.fix,
      );
    }
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-f, --fix [kind]',
    description: 'fix issues',
    required: false,
  })
  fix(value: string): WorkspaceHealthFixKind {
    if (!Object.values(WorkspaceHealthFixKind).includes(value as any)) {
      throw new Error(`Invalid fix kind ${value}`);
    }

    return value as WorkspaceHealthFixKind;
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Detailed output',
    required: false,
  })
  parseVerbose(): boolean {
    return true;
  }

  @Option({
    flags: '-m, --mode [mode]',
    description: 'Mode of the health check [structure, metadata, all]',
    required: false,
    defaultValue: WorkspaceHealthMode.All,
  })
  parseMode(value: string): WorkspaceHealthMode {
    if (!Object.values(WorkspaceHealthMode).includes(value as any)) {
      throw new Error(`Invalid mode ${value}`);
    }

    return value as WorkspaceHealthMode;
  }
}
