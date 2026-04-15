export class LevelManager {
  private currentLevelId: number = 0;

  loadLevel(levelId: number): void {
    this.currentLevelId = levelId;
    // TODO: Load level data (tilemaps, spawn points, interactive objects)
  }

  getCurrentLevelId(): number {
    return this.currentLevelId;
  }

  advance(): number {
    this.currentLevelId += 1;
    return this.currentLevelId;
  }
}
