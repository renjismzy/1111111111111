#!/usr/bin/env node

import { $ } from "execa"
import inquirer from "inquirer"
import { Command } from "commander"
import boxen from "boxen"
import chalk from "chalk"
import fs from "fs-extra"
import path from "path"

function detectPackageManager(): string {
	const userAgent = process.env.npm_config_user_agent

	if (userAgent) {
		if (userAgent.startsWith("yarn")) return "yarn"
		if (userAgent.startsWith("pnpm")) return "pnpm"
		if (userAgent.startsWith("bun")) return "bun"
		if (userAgent.startsWith("npm")) return "npm"
	}

	return "npm"
}

// Establish CLI args/flags
const program = new Command()
program.argument("[projectName]", "Name of the project").parse(process.argv)
program.option("--package-manager", "Package manager to use")

let [projectName] = program.args
const packageManager = program.opts().packageManager || detectPackageManager()

// If no project name is provided, prompt the user for it
if (!projectName) {
	const { projectName: promptedName } = await inquirer.prompt([
		{
			type: "input",
			name: "projectName",
			message: "What is your project name?",
			validate: (input: string) => {
				if (!input.trim()) {
					return "Project name cannot be empty"
				}
				return true
			},
		},
	])
	// Use the prompted name
	console.log(`Creating project: ${promptedName}`)
	projectName = promptedName
} else {
	// Use the provided name
	console.log(`Creating project: ${projectName}`)
}

async function load<T>(
	startMsg: string,
	endMsg: string,
	command: () => Promise<T>,
): Promise<T> {
	process.stdout.write(`[ ] ${startMsg}\r`)
	const loadingChars = ["|", "/", "-", "\\"]
	let i = 0
	const loadingInterval = setInterval(() => {
		process.stdout.write(`[${loadingChars[i]}] ${startMsg}\r`)
		i = (i + 1) % loadingChars.length
	}, 250)

	const result = await command()
	clearInterval(loadingInterval)
	process.stdout.write(`\r\x1b[K[\u2713] ${endMsg}\n`)
	return result
}

await load("Creating project from scaffold...", "Project created", async () => {
	// Copy scaffold directory from current location
	const scaffoldPath = path.join(process.cwd(), "scaffold")
	const projectPath = path.join(process.cwd(), projectName)
	
	// Create project directory and copy scaffold contents
	await fs.ensureDir(projectPath)
	await fs.copy(scaffoldPath, projectPath)
})

await load("Navigating to project...", "Project navigated", async () => {
	// await $`cd ${projectName}`; Not needed - we use cwd option instead
})
// Clean up unnecessary files
const projectPath = path.join(process.cwd(), projectName)
const gitPath = path.join(projectPath, ".git")
const packageLockPath = path.join(projectPath, "package-lock.json")
const nodeModulesPath = path.join(projectPath, "node_modules")

if (await fs.pathExists(gitPath)) await fs.remove(gitPath)
if (await fs.pathExists(packageLockPath)) await fs.remove(packageLockPath)
if (await fs.pathExists(nodeModulesPath)) await fs.remove(nodeModulesPath)

await load("Installing dependencies...", "Dependencies installed", async () => {
	console.log("\n\n")
	await $({ cwd: projectName, stdio: "inherit" })`${packageManager} install`
})

console.log(
	"\n\n\n" +
		boxen(
			`Welcome to your MCP server! To get started, run: ${chalk.rgb(
				234,
				88,
				12,
			)(
				`\n\ncd ${projectName} && ${packageManager} run dev`,
			)}\n\nTry saying something like 'Say hello to John' to execute your tool!`,
			{
				padding: 2,
				textAlignment: "center",
			},
		),
)
