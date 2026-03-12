package org.generation.socialNetwork.users.repository;

import org.generation.socialNetwork.users.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}