from flask import Flask, render_template, request, redirect

app = Flask(__name__)
tasks = []

@app.route("/", methods=["GET", "POST"])
def todo():
    if request.method == "POST":
        task = request.form.get("task")
        if task:
            tasks.append({"task": task, "done": False})
    return render_template("todo.html", tasks=tasks)

@app.route("/complete/<int:index>")
def complete(index):
    if 0 <= index < len(tasks):
        tasks[index]["done"] = True
    return redirect("/")

@app.route("/delete/<int:index>")
def delete(index):
    if 0 <= index < len(tasks):
        tasks.pop(index)
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)
