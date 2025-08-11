#!/usr/bin/env python3
"""
Startup script for OAMK Work Certificate Processor
Launches both backend API and frontend development server
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

def print_banner():
    """Print application banner."""
    print("=" * 60)
    print("🎓 OAMK Work Certificate Processor")
    print("   Academic Credit Evaluation System")
    print("=" * 60)
    print()

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("ERROR: Python 3.8+ required")
        return False
    
    # Check if Node.js is available
    npm_paths = [
        "npm",  # Try direct command first
        "C:\\Program Files\\nodejs\\npm.cmd",  # Windows default
        "C:\\Program Files (x86)\\nodejs\\npm.cmd",  # Windows 32-bit
    ]
    
    node_found = False
    for path in npm_paths:
        try:
            result = subprocess.run([path, "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Node.js found: {result.stdout.strip()}")
                node_found = True
                break
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue
    
    if not node_found:
        print("ERROR: Node.js not found. Please install Node.js from https://nodejs.org/")
        return False
    
    # Check if backend dependencies are installed (from frontend directory)
    backend_dir = Path("../backend")
    if not backend_dir.exists():
        print("ERROR: Backend directory not found")
        return False
    
    # Check if backend virtual environment exists
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("WARNING: Backend virtual environment not found. Creating one...")
        try:
            subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)
            print("✅ Virtual environment created")
        except subprocess.CalledProcessError:
            print("ERROR: Failed to create virtual environment")
            return False
    
    # Check if requirements.txt exists
    requirements_file = backend_dir / "requirements.txt"
    if not requirements_file.exists():
        print("ERROR: Backend requirements.txt not found")
        return False
    
    # Check if key packages are installed
    try:
        # Activate virtual environment and check for google.generativeai
        if os.name == 'nt':  # Windows
            python_path = venv_dir / "Scripts" / "python.exe"
            pip_path = venv_dir / "Scripts" / "pip.exe"
        else:  # Unix/Linux/Mac
            python_path = venv_dir / "bin" / "python"
            pip_path = venv_dir / "bin" / "pip"
        
        if not python_path.exists():
            print("ERROR: Python not found in virtual environment")
            return False
        
        # Check if google.generativeai is installed
        result = subprocess.run([str(python_path), "-c", "import google.generativeai"], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print("WARNING: Backend dependencies not installed. Installing...")
            try:
                subprocess.run([str(pip_path), "install", "-r", str(requirements_file)], check=True)
                print("✅ Backend dependencies installed")
            except subprocess.CalledProcessError:
                print("ERROR: Failed to install backend dependencies")
                return False
        else:
            print("✅ Backend dependencies found")
            
    except Exception as e:
        print(f"ERROR: Failed to check backend dependencies: {e}")
        return False
    
    # Check if frontend dependencies are installed
    frontend_dir = Path(".")
    if not (frontend_dir / "node_modules").exists():
        print("WARNING: Frontend dependencies not installed. Run 'npm install' in frontend directory")
        return False
    
    print("✅ Dependencies check passed")
    return True

def start_backend():
    """Start the backend API server."""
    print("🚀 Starting backend API server...")
    
    backend_dir = Path("../backend")
    api_file = backend_dir / "src" / "api.py"
    
    if not api_file.exists():
        print(f"ERROR: API file not found: {api_file}")
        return None
    
    # Set environment variables
    env = os.environ.copy()
    env["PYTHONPATH"] = str(backend_dir / "src")
    
    # Use virtual environment Python
    venv_dir = backend_dir / "venv"
    if os.name == 'nt':  # Windows
        venv_python = venv_dir / "Scripts" / "python.exe"
    else:  # Unix/Linux/Mac
        venv_python = venv_dir / "bin" / "python"
    
    try:
        # Start the backend server
        backend_process = subprocess.Popen(
            [str(venv_python), "src/api.py"],
            cwd=backend_dir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for the server to start
        time.sleep(3)
        
        if backend_process.poll() is None:
            print("✅ Backend API server started on http://localhost:8000")
            return backend_process
        else:
            stdout, stderr = backend_process.communicate()
            print(f"ERROR: Backend failed to start:")
            print(f"   STDOUT: {stdout}")
            print(f"   STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"ERROR: Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend development server."""
    print("🚀 Starting frontend development server...")
    
    frontend_dir = Path(".")
    
    try:
        # Try to find npm in common locations
        npm_paths = [
            "npm",  # Try direct command first
            "C:\\Program Files\\nodejs\\npm.cmd",  # Windows default
            "C:\\Program Files (x86)\\nodejs\\npm.cmd",  # Windows 32-bit
        ]
        
        npm_cmd = None
        for path in npm_paths:
            try:
                subprocess.run([path, "--version"], capture_output=True, check=True)
                npm_cmd = path
                break
            except (subprocess.CalledProcessError, FileNotFoundError):
                continue
        
        if not npm_cmd:
            print("ERROR: npm not found. Please install Node.js from https://nodejs.org/")
            return None
        
        # Start the frontend server
        frontend_process = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for the server to start
        time.sleep(5)
        
        if frontend_process.poll() is None:
            print("✅ Frontend development server started on http://localhost:5173")
            return frontend_process
        else:
            stdout, stderr = frontend_process.communicate()
            print(f"ERROR: Frontend failed to start:")
            print(f"   STDOUT: {stdout}")
            print(f"   STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"ERROR: Failed to start frontend: {e}")
        return None

def monitor_processes(backend_process, frontend_process):
    """Monitor the running processes."""
    try:
        while True:
            # Check if processes are still running
            if backend_process and backend_process.poll() is not None:
                print("ERROR: Backend process stopped unexpectedly")
                break
                
            if frontend_process and frontend_process.poll() is not None:
                print("ERROR: Frontend process stopped unexpectedly")
                break
                
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        
        # Terminate processes
        if backend_process:
            backend_process.terminate()
            backend_process.wait()
            print("✅ Backend server stopped")
            
        if frontend_process:
            frontend_process.terminate()
            frontend_process.wait()
            print("✅ Frontend server stopped")

def main():
    """Main startup function."""
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("\nERROR: Dependency check failed. Please fix the issues above.")
        sys.exit(1)
    
    print()
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("\nERROR: Failed to start backend. Please check the error messages above.")
        sys.exit(1)
    
    print()
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("\nERROR: Failed to start frontend. Please check the error messages above.")
        if backend_process:
            backend_process.terminate()
        sys.exit(1)
    
    print()
    print("🎉 Application started successfully!")
    print("   Frontend: http://localhost:5173")
    print("   Backend API: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    print()
    print("Press Ctrl+C to stop all servers")
    print()
    
    # Monitor processes
    monitor_processes(backend_process, frontend_process)

if __name__ == "__main__":
    main() 