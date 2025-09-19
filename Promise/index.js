class BasePromise {
  constructor(executor) {
    this.state = "pending"; // promise의 상태 : pending, fulfilled, rejected
    this.value = undefined; // promise의 값
    this.reason = undefined; // promise의 실패했을때의 이유

    // pending 상태에서 등록된 콜백들
    this.onFulfilledCallbacks = []; // promise의 콜백 함수
    this.onRejectedCallbacks = []; // promise의 콜백 함수

    this.executor = executor; // executor 함수

    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        queueMicrotask(() => {
          this.onFulfilledCallbacks.forEach((cb) => cb());
        });
      }
    };
    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;

        queueMicrotask(() => {
          this.onRejectedCallbacks.forEach((callback) => callback());
        });
      }
    };

    try {
      this.executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // then은 항상 새로운 Promise를 반환
    return new BasePromise((resolve, reject) => {
      if (this.state === "fulfilled") {
        // fulfilled 상태란? Promise가 성공적으로 완료된 상태
        if (typeof onFulfilled === "function") {
          try {
            // onFulfilled 호출하고 결과를 다음 Promise에 전달
            const result = onFulfilled(this.value);
            // result가 BasePromise인지 확인
            if (result instanceof BasePromise) {
              // BasePromise라면 그 결과를 기다림
              result.then(resolve, reject);
            } else {
              // 일반 값이라면 그대로 전달
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          // onFulfilled가 함수가 아니면 값 그대로 전달
          resolve(this.value);
        }
      } else if (this.state === "rejected") {
        // onRejected가 함수인지 확인
        if (typeof onRejected === "function") {
          try {
            // 🔥 중요: onRejected가 성공적으로 실행되면 resolve!
            const result = onRejected(this.reason);
            // result가 BasePromise인지 확인
            if (result instanceof BasePromise) {
              // BasePromise라면 그 결과를 기다림
              result.then(resolve, reject);
            } else {
              // 일반 값이라면 그대로 전달
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          // onRejected가 함수가 아니면 에러 그대로 전달
          reject(this.reason);
        }
      } else if (this.state === "pending") {
        this.onFulfilledCallbacks.push(() => {
          if (typeof onFulfilled === "function") {
            try {
              const result = onFulfilled(this.value);
              // result가 Promise인지 확인
              if (result instanceof BasePromise) {
                // Promise라면 그 결과를 기다림
                result.then(resolve, reject);
              } else {
                // 일반 값이라면 그대로 전달
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          } else {
            // onFulfilled가 함수가 아니면 값 그대로 전달
            resolve(this.value);
          }
        });
        this.onRejectedCallbacks.push(() => {
          if (typeof onRejected === "function") {
            try {
              const result = onRejected(this.reason);
              // result가 Promise인지 확인
              if (result instanceof BasePromise) {
                // Promise라면 그 결과를 기다림
                result.then(resolve, reject);
              } else {
                // 일반 값이라면 그대로 전달
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          } else {
            // onRejected가 함수가 아니면 에러 그대로 전달
            reject(this.reason);
          }
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally();
        return value;
      },
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }
}

// 가짜 API 함수들 (실제 API 호출을 시뮬레이션)
function fetchUser(userId) {
  return new BasePromise((resolve, reject) => {
    console.log(`사용자 ${userId} 정보를 가져오는 중...`);
    setTimeout(() => {
      if (userId === 1) {
        resolve({
          id: 1,
          name: "김철수",
          email: "kim@example.com",
          age: 30,
        });
      } else if (userId === 2) {
        resolve({
          id: 2,
          name: "이영희",
          email: "lee@example.com",
          age: 25,
        });
      } else {
        reject(new Error(`사용자 ID ${userId}를 찾을 수 없습니다.`));
      }
    }, 1000);
  });
}

function fetchUserPosts(userId) {
  return new BasePromise((resolve, reject) => {
    console.log(`사용자 ${userId}의 게시글을 가져오는 중...`);
    setTimeout(() => {
      if (userId === 1) {
        resolve([
          { id: 1, title: "첫 번째 게시글", content: "안녕하세요!" },
          { id: 2, title: "두 번째 게시글", content: "오늘 날씨가 좋네요" },
        ]);
      } else if (userId === 2) {
        resolve([{ id: 3, title: "영희의 게시글", content: "새로운 프로젝트를 시작했어요" }]);
      } else {
        reject(new Error(`사용자 ${userId}의 게시글을 찾을 수 없습니다.`));
      }
    }, 800);
  });
}

function fetchPostComments(postId) {
  return new BasePromise((resolve, reject) => {
    console.log(`게시글 ${postId}의 댓글을 가져오는 중...`);
    setTimeout(() => {
      if (postId === 1) {
        resolve([
          { id: 1, author: "박민수", comment: "좋은 글이네요!" },
          { id: 2, author: "정수진", comment: "공감합니다" },
        ]);
      } else {
        resolve([]); // 댓글이 없는 경우
      }
    }, 600);
  });
}

function updateUserProfile(userId, profileData) {
  return new BasePromise((resolve, reject) => {
    console.log(`사용자 ${userId}의 프로필을 업데이트하는 중...`);
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // 90% 성공률
        resolve({
          success: true,
          message: "프로필이 성공적으로 업데이트되었습니다.",
          updatedAt: new Date().toISOString(),
        });
      } else {
        reject(new Error("서버 오류로 인해 업데이트에 실패했습니다."));
      }
    }, 1200);
  });
}

// 테스트 실행
console.log("=== 실제 API 사용 시나리오 테스트 ===\n");

// 시나리오 1: 사용자 정보와 게시글을 순차적으로 가져오기
console.log("📱 시나리오 1: 사용자 정보 + 게시글 가져오기");
fetchUser(1)
  .then((user) => {
    console.log("✅ 사용자 정보:", user);
    return fetchUserPosts(user.id);
  })
  .then((posts) => {
    console.log("✅ 사용자 게시글:", posts);
    console.log("📊 총 게시글 수:", posts.length);
  })
  .catch((error) => {
    console.error("❌ 에러 발생:", error.message);
  });

// // 시나리오 2: 사용자 정보와 게시글을 병렬로 가져오기
// console.log("\n📱 시나리오 2: 사용자 정보 + 게시글 병렬 가져오기");
// const userPromise = fetchUser(2);
// const postsPromise = fetchUserPosts(2);

// userPromise.then((user) => {
//   console.log("✅ 사용자 정보:", user);
// });

// postsPromise.then((posts) => {
//   console.log("✅ 사용자 게시글:", posts);
// });

// // 시나리오 3: 게시글의 댓글까지 가져오는 중첩 체이닝
// console.log("\n📱 시나리오 3: 사용자 → 게시글 → 댓글 가져오기");
// fetchUser(1)
//   .then((user) => {
//     console.log("✅ 사용자:", user.name);
//     return fetchUserPosts(user.id);
//   })
//   .then((posts) => {
//     console.log("✅ 게시글 수:", posts.length);
//     if (posts.length > 0) {
//       return fetchPostComments(posts[0].id);
//     }
//     return [];
//   })
//   .then((comments) => {
//     console.log("✅ 첫 번째 게시글 댓글:", comments);
//   })
//   .catch((error) => {
//     console.error("❌ 에러:", error.message);
//   });

// // 시나리오 4: 프로필 업데이트 (성공/실패 케이스)
console.log("\n📱 시나리오 4: 프로필 업데이트");
updateUserProfile(1, { name: "김철수", age: 31 })
  .then((result) => {
    console.log("✅ 업데이트 성공:", result.message);
    console.log("🕐 업데이트 시간:", result.updatedAt);
  })
  .catch((error) => {
    console.error("❌ 업데이트 실패:", error.message);
  });

// // 시나리오 5: 에러 처리와 복구
// console.log("\n📱 시나리오 5: 에러 처리와 복구");
// fetchUser(999) // 존재하지 않는 사용자
//   .then((user) => {
//     console.log("사용자 정보:", user);
//   })
//   .catch((error) => {
//     console.log("❌ 첫 번째 시도 실패:", error.message);
//     console.log("🔄 기본 사용자로 재시도...");
//     return fetchUser(1); // 기본 사용자로 재시도
//   })
//   .then((user) => {
//     console.log("✅ 복구 성공:", user.name);
//   })
//   .catch((error) => {
//     console.error("❌ 복구도 실패:", error.message);
//   });

// // 시나리오 6: finally를 사용한 정리 작업
// console.log("\n📱 시나리오 6: finally를 사용한 정리 작업");
// fetchUser(2)
//   .then((user) => {
//     console.log("✅ 사용자 로딩 완료:", user.name);
//     return user;
//   })
//   .finally(() => {
//     console.log("🧹 로딩 상태 정리 완료");
//   });

// console.log("\n=== 모든 API 테스트가 시작되었습니다! ===");
