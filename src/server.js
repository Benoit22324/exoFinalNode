import http from "node:http";
import fs from "node:fs";
import dotenv from "dotenv";
import pug from "pug";
import path from "node:path";
import querystring from "node:querystring";
import { dataPath, homePath, modifyPath, studentPath, stylePath } from "./utils/paths.js";

dotenv.config();

const { APP_PORT, APP_HOSTNAME } = process.env;

const students = JSON.parse(fs.readFileSync(dataPath, { encoding: "utf8" }));
let studentList = [...students];
let edited = false;

const server = http.createServer((req, res) => {
    const url = req.url.replace("/", "");

    if (studentList.length !== students.length || edited) {
        fs.writeFileSync(dataPath, JSON.stringify(studentList));
    }

    if (url === "favicon.ico") {
        res.writeHead(200, {
            "content-type": "image/x-icon"
        })
        res.end();
        return
    }

    if (url.startsWith("css")) {
		const stylesheetName = url.split("/").pop()
		const stylesheet = fs.readFileSync(path.join(stylePath, stylesheetName))
		
		res.writeHead(200, {
			"content-type": "text/css"
		})
		res.end(stylesheet)
		return
	}

    if (url === "student") {
        res.writeHead(200, {
            "content-type": "text/html"
        })
        pug.renderFile(studentPath, { pretty: true, studentList, changes: studentList.length !== students.length }, (err, html) => {
            if (err) throw err
            res.end(html)
        })
        return
    }

    if (url === "" && req.method === "POST") {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on("end", () => {
            const data = querystring.parse(body)

            if (!data.name || !data.date || data.name.trim() === "" || data.date.trim() === "") {
                res.writeHead(401, {"Content-type" : "text/plain"})
                res.end("Les champs nom et date ne peuvent pas être vide")
                return
            }

            const newStudent = {
                name: data.name,
                birth: data.date
            }

            studentList.push(newStudent)
            res.writeHead(302, {
                "Location": "/"
            })
            res.end()
            return
        })
        return
    }

    if (url.startsWith("modify") && req.method === "GET") {
        const name = url.split("/").pop();
        const student = studentList.find((student) => student.name === name);

		res.writeHead(200, {
            "content-type": "text/html"
        })
        pug.renderFile(modifyPath, { pretty: true, changes: edited, student }, (err, html) => {
            if (err) throw err
            res.end(html)
        })
		return
    }

    if (url.startsWith("modify") && req.method === "POST") {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on("end", () => {
            const data = querystring.parse(body)

            if (!data.name || !data.date || data.name.trim() === "" || data.date.trim() === "") {
                res.writeHead(401, {"Content-type" : "text/plain"})
                res.end("Les champs nom et date ne peuvent pas être vide")
                return
            }

            const newStudent = {
                name: data.name,
                birth: data.date
            }

            studentList = studentList.map((student) => {
                if (student.name === data.oldName) return newStudent
                return student
            })

            edited = true;

            res.writeHead(302, {
                "Location": `/modify/${newStudent.name}`
            })
            res.end()
            return
        })
        return
    }

    if (url.startsWith("delete")) {
        const name = url.split("/").pop();
        studentList = studentList.filter((student) => student.name !== name);

		res.writeHead(302, {
			"location": "/student"
		})
		res.end()
		return
    }

    res.writeHead(200, {
        "content-type": "text/html"
    })
    pug.renderFile(homePath, { pretty: true, changes: studentList.length !== students.length }, (err, html) => {
        if (err) throw err
        res.end(html)
    })
})

server.listen(APP_PORT, APP_HOSTNAME, () => {
    console.log("Serveur lancé !");
})