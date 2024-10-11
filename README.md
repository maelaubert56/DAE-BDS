<h1 align="center">DAE-BDS - Excused Absence Request Management System</h1>

<div align="center">

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeMailer](https://img.shields.io/badge/nodemailer-blue.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjgwIiBoZWlnaHQ9IjM4MiIgdmlld0JveD0iMCAwIDY4MCAzODIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02NDAgNDBMMzgxIDM0Mkg2NDBWNDBaIiBmaWxsPSIjMEY5RENFIi8+CjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIwX2RfMV8xMSkiPgo8cGF0aCBkPSJNNjQwIDQwTDQwOSAzNDJINjQwVjQwWiIgZmlsbD0iIzBGOURDRSIvPgo8L2c+CjxwYXRoIGQ9Ik0wIDQwTDI1OSAzNDJIMFY0MFoiIGZpbGw9IiMyMkI1NzMiLz4KPHBhdGggZD0iTTI1OSA0MEw1MTggMzQySDI1OVY0MFoiIGZpbGw9IiMyOUFCRTIiLz4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImZpbHRlcjBfZF8xXzExIiB4PSIzNjkuOSIgeT0iMC45MDAwMDIiIHdpZHRoPSIzMDkuMiIgaGVpZ2h0PSIzODAuMiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0Lz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMTkuNTUiLz4KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0ib3V0Ii8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjI1IDAiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3dfMV8xMSIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvd18xXzExIiByZXN1bHQ9InNoYXBlIi8+CjwvZmlsdGVyPgo8L2RlZnM+Cjwvc3ZnPgo=)
![MongoDB](https://img.shields.io/badge/mongodb-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

<div align="center">
  
👉 [docs.bds-efrei.fr](https://docs.bds-efrei.fr)
</div>

<br>

> <p align="center">🎓 <strong>DAE-BDS</strong> is an automated solution designed to streamline the process of managing Excused Absence Requests for students, association members and school administration.</p>

<br>

## <h2>🎡 Project Overview</h2>

**DAE-BDS** is a web-based application built to automate and manage Excused Absence Requests (**DAE**) for association members at **EFREI Paris Engineering School**. This platform makes it easy for students to fill in absence requests, track their progress, and receive official approval from both the **EFREI's Sport Association (BDS)** and the **EFREI administration**.

This solution is currently deployed and used by the **BDS** association at **Efrei**, which serves hundreds of members. The system aims to simplify the process for students and reduce the administrative workload for the staff involved.

<br>

## <h2>🚀 Features</h2>
- **User-Friendly Interface**: A simple and intuitive interface to fill out and manage Excused Absence Requests.
- **Automatic Routing**: Requests are routed to the correct people (association manager and school administration) for approval.
- **Notification System**: Email notifications for members when new requests are submitted.
- **Signature Automation**: Requests are signed electronically by association managers with a simple button click.
- **File Autogeneration**: Official DAE documents are automatically completed and emailed back to the student after all signatures are collected.
- **Staff Management**: Privileges for managing staff and request validations.
- **Notification Preferences**: Users can opt out of email notifications if desired.

<br>

## <h2>💻 Technologies Used</h2>

- **Frontend**: [ReactJS](https://reactjs.org/) with [Tailwind CSS](https://tailwindcss.com/) for styling.
- **Backend**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/) for the server-side logic.
- **Database**: [MongoDB](https://www.mongodb.com/) to manage user and request data.

<br>

## <h2>🌟 How to Use</h2>
- **Step 1**: Students submit their Excused Absence Request through the web application.
- **Step 2**: The request is routed to the association representative for review and signature.
- **Step 3**: After the association's approval, the request is forwarded to the school administration for final approval.
- **Step 4**: Once approved by all parties, the signed document is emailed to the student, who can send it to the school's attendance department.

<br>

## <h2>📜 About the Author</h2>
[![Maël Aubert](https://img.shields.io/badge/-Maël%20Aubert-181717?&logo=github&logoColor=white)](https://github.com/maelaubert56) - Developer, Maintainer & Project Owner

<br>

## <h2>📥 Contact</h2>
If you have any questions or need assistance, feel free to contact me at [mael.aubert@bds-efrei.fr](mailto:mael.aubert@bds-efrei.fr).

<br>

## <h2>📄 Licence</h2>
Le code source de ce projet est mis à disposition exclusivement à des fins de consultation et de présentation dans le cadre de mon portfolio personnel. Toute utilisation, reproduction, modification, distribution ou toute autre forme d'exploitation de ce code par des organisations, y compris des associations à but non lucratif ou à but lucratif, est strictement interdite sans autorisation écrite préalable de l'auteur.

