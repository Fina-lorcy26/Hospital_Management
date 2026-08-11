package main

import (
	"context"
	"fmt"
)

// L'appli principale, conserve le contexte d'execution de wails
type App struct {
	ctx context.Context
}

// Constructeur de App qui va initialiser et retourner une nouvelle instance de app
func NewApp() *App {
	return &App{}
}

// Stockage de contexte et initialisation de la BD
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	initDatabase()
}

// Message de bienvenu
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s", name)
}
