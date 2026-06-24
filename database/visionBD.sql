-- ============================================
-- NIVEAU 0
-- ============================================

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    photo_profil VARCHAR(255) NULL,
    bio TEXT NULL,
    etablissement VARCHAR(150) NULL,
    competences VARCHAR(255) NULL,
    lien_github VARCHAR(255) NULL,
    lien_portfolio VARCHAR(255) NULL,
    email_verifie BOOLEAN NOT NULL DEFAULT FALSE,
    token_verification VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom ENUM('admin','resp_activites','resp_materiels','professeur','membre_vision') NOT NULL UNIQUE,
    description VARCHAR(255) NULL
);

-- ============================================
-- NIVEAU 1
-- ============================================

CREATE TABLE adhesions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    statut_labvision ENUM('president','responsable','membre_simple','collaborateur','partenaire','professeur') NOT NULL,
    date_demande TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validee BOOLEAN NOT NULL DEFAULT FALSE,
    valide_par INT UNSIGNED NULL,
    date_validation TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (valide_par) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    attribue_par INT UNSIGNED NULL,
    date_attribution TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (attribue_par) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- SEED — données de référence pour roles
-- ============================================

INSERT INTO roles (nom, description) VALUES
('admin', 'Accès complet à la plateforme'),
('resp_activites', 'Gère les événements'),
('resp_materiels', 'Gère les matériels et réservations'),
('professeur', 'Peut publier des ressources pédagogiques'),
('membre_vision', 'Rôle de base pour tout utilisateur inscrit');