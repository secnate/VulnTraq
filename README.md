# VulnTraq
This is the Github repository for VulnTraq, a free open-source prototype of a vulnerability management tool for small and medium-size enterprises. This was Nathan's Practicum project for completing Georgia Tech's Masters in Information Security. This project was completed during the Summer of 2022

# Mission
Many organizations, especially smaller and medium-sized ones, have resorted to keeping track of their vulnerability management programs’ information and states in documents shared among their staff. These are typically Excel spreadsheets shared between multiple staffers on a shared drive and specify information regarding unpatched vulnerabilities, any and all tickets created, opened, and closed, patching due dates, and other relevant information. 

However, this approach has the following downsides:

1. Loading an Excel spreadsheet from the shared drive and saving the changes made to it can be a significantly slow process
There is no automated report-generation mechanism. While spreadsheets may have some custom logic for graphing tables’ data, answering questions such as, “which patches have not been completed by the due date?” is a necessary capability for any vulnerability-handling program to have. Manually reviewing a tracker spreadsheets’ entries to compile such a list is woefully inefficient.

2. The lack of a standard vulnerability-handling Excel spreadsheet template means that organizations would typically need to create one from scratch when developing vulnerability-handling programs instead of having a versatile vulnerability-handling tracking solution at hand. This is a significant inefficiency from the perspective of the man-hours involved in preparing a functional tracker document

3. If multiple staff members have a share-file based spreadsheet open simultaneously, ensuring that their changes properly synchronize and do not accidentally clash is a challenge. Alternative methods providing such capabilities such as Google Drive and Microsoft OneDrive are cloud-based but many organizations are reluctant to use them. The reluctance to store such sensitive data in the cloud is understandable, with 90% of organizations being very or moderately concerned about public cloud security per [Bitglass’ 2015 Cloud Security Report.](https://pages.bitglass.com/Cloud-Security-Report-2015-PDF.html) 

Therefore a free and open vulnerability-handling tracker tool is needed. *VulnTraq* is a free open-source prototype of such a solution. It interfaces with *UVDesk*, a free and open source ticketing system that smaller and medium-sized enterprises may use.

# Technology Stack

## Frontend:
- Vue.JS framework with Bootstrap Vue components

## Backend:

- UVDesk: a free open-source ticketing system with [a robust API](https://github.com/uvdesk/api-bundle) and a MySQL database
- Ngrok: a free utility allowing a locally hosted application to be accessed with a publicly-accessible url

## Prototype's System Design:

Both this prototype's frontend and backend were locally hosted and executed for this prototype. 

**Backend:**
The UVDesk backend [was installed](https://computingforgeeks.com/setup-uvdesk-ticketing-system-on-ubuntu/) on an Ubuntu 18.04.6 LTS virtual machine. The UVDesk application was hosted within the server at http://localhost:8080. Ngrok made it publicly accessible to the host computer running the virtualized server

**Frontend:**
The Vue.JS frontend was locally hosted and made API requests through Ngrok to the UVDesk application.

# Running The Prototype
To run the frontend, go into the `vulntraq-frontend` folder in the command line and use the `npm run serve` command to display it within your computer's browser at the `http://localhost:8080` address.

Open the server virtual machine and use Ngrok to reverse proxy it from the http://localhost:8080 to a publicly acessible URL.

The frontend is then to communicate with the virtualized server using [UVDesk's API](https://github.com/uvdesk/api-bundle). The main issue is that sending REST API requests from a frontend running at http://localhost:8080 to the Ngrok-generated URL for accessing the backend creates _Cross-Origin Request Sharing_ errors.

Given the project's nature, tight time constraints, and extensive efforts in addressing the problem systematically being unsuccessful, there was a need for a speedy workaround. Thankfully, one was found. It involves running the _VulnTraq_ application's frontend in the Chrome browser with [its same-origin policy temporarily disabled.](https://stackoverflow.com/a/42024918) This prevented such errors from firing on the REST API request -- and for project development to continue.
