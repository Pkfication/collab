# Collab: Collaborative Drawing App

Collab is a real-time collaborative drawing application designed for creative sessions between you and your loved ones, accessible from any device. The main purpose is to enable drawing together with your daughter from different devices, making creativity a shared experience.

## Features

- Real-time collaborative drawing
- Multi-device support
- Modern Rails 8 stack with Hotwire (Turbo & Stimulus)
- Beautiful UI with Tailwind CSS
- Simple local setup and Dockerized deployment

## Tech Stack

- **Ruby:** 3.3.6
- **Rails:** 8.0.1
- **Database:** SQLite3 (default)
- **Frontend:** Hotwire (Turbo, Stimulus), Tailwind CSS
- **Other:** Docker, Kamal, Puma, Propshaft

## Getting Started

### Prerequisites

- Ruby 3.3.6
- Node.js & Yarn
- SQLite3
- Bundler (`gem install bundler`)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd collab
   ```
2. **Install dependencies:**
   ```sh
   bundle install
   yarn install
   ```
3. **Set up the database:**
   ```sh
   bin/rails db:setup
   ```
4. **Start the development server:**

   ```sh
   bin/rails server
   # In another terminal, run:
   bin/rails tailwindcss:watch
   ```

   Or use [foreman](https://github.com/ddollar/foreman) to run both:

   ```sh
   foreman start -f Procfile.dev
   ```

5. **Visit:** [http://localhost:3000](http://localhost:3000)

## Running Tests

This project uses Rails' built-in test framework (Minitest):

```sh
bin/rails test
```

## Deployment

### Docker

A production-ready Dockerfile is included. To build and run:

```sh
docker build -t collab .
docker run -d -p 80:80 -e RAILS_MASTER_KEY=<your-master-key> --name collab collab
```

### Kamal

Deployment with [Kamal](https://kamal-deploy.org) is supported. See `.kamal/` for configuration.

## Configuration

- **Database:** Configured via `config/database.yml` (default: SQLite3)
- **Environment Variables:** Set `RAILS_MASTER_KEY` for production secrets

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

_Happy drawing!_ 🎨
